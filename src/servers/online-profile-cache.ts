import type { AvailableServerProfile } from './server-profile';
import { createDirectHttpFetch } from '../resources/direct-http-resource';

const CACHE_KEY = 'lastro-official-online-profiles-v1';
const MAX_SCRIPT_BYTES = 4 * 1024 * 1024;
const OFFICIAL_SOURCE = new URL('/ro/Online.js', 'https://game.lastro.cn');
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

export interface OfficialServerEntry {
  address: string;
  port: number;
  version: number;
  langtype: number;
  relayEndpoint?: string;
}

export interface OfficialOnlineProfiles {
  schema: 1;
  fetchedAt: number;
  servers: Record<string, OfficialServerEntry>;
  clientVer3Keys?: [number, number, number];
  otherClientVerKeys?: [number, number, number];
  packetKeysByDate: Record<string, [number, number, number]>;
}

function numeric(value: unknown, max: number): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max;
}

function validKeys(value: unknown): value is [number, number, number] {
  return Array.isArray(value) && value.length === 3 && value.every(key => numeric(key, 0xffffffff));
}

function validEntry(value: unknown): value is OfficialServerEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<OfficialServerEntry>;
  return typeof entry.address === 'string' && entry.address.length <= 253
    && /^(?=.{1,253}$)[a-z0-9.-]+$/i.test(entry.address)
    && !entry.address.startsWith('.') && !entry.address.endsWith('.')
    && numeric(entry.port, 65535) && entry.port > 0
    && numeric(entry.version, 0xffff) && numeric(entry.langtype, 255)
    && (entry.relayEndpoint === undefined || typeof entry.relayEndpoint === 'string'
      && entry.relayEndpoint.length <= 300
      && /^wss?:\/\/[a-z0-9.-]+(?::\d{1,5})?\/?$/i.test(entry.relayEndpoint));
}

function validateSnapshot(raw: unknown): OfficialOnlineProfiles | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Partial<OfficialOnlineProfiles>;
  if (value.schema !== 1 || !numeric(value.fetchedAt, Number.MAX_SAFE_INTEGER)
    || value.fetchedAt > Date.now() + 60_000 || Date.now() - value.fetchedAt > MAX_AGE_MS
    || !value.servers || typeof value.servers !== 'object' || Array.isArray(value.servers)
    || !value.packetKeysByDate || typeof value.packetKeysByDate !== 'object'
    || Array.isArray(value.packetKeysByDate)) return null;
  const entries = Object.entries(value.servers);
  if (!entries.length || entries.length > 32 || entries.some(([id, server]) =>
    !/^(0|[1-9]\d{0,3})$/.test(id) || !validEntry(server))) return null;
  const dates = Object.entries(value.packetKeysByDate);
  if (dates.length > 256 || dates.some(([date, keys]) => !/^20\d{6}$/.test(date) || !validKeys(keys))) return null;
  if (value.clientVer3Keys !== undefined && !validKeys(value.clientVer3Keys)) return null;
  if (value.otherClientVerKeys !== undefined && !validKeys(value.otherClientVerKeys)) return null;
  return value as OfficialOnlineProfiles;
}

export function readOfficialOnlineProfiles(storage?: Pick<Storage, 'getItem'>): OfficialOnlineProfiles | null {
  try {
    const json = (storage ?? globalThis.localStorage)?.getItem(CACHE_KEY);
    return json ? validateSnapshot(JSON.parse(json)) : null;
  } catch { return null; }
}

function decodeLiteral(value: string): string | null {
  try {
    const doubleQuoted = value.startsWith('"') ? value : '"'
      + value.slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"') + '"';
    return JSON.parse(doubleQuoted.replace(/\\x([0-9a-f]{2})/gi, '\\u00$1')) as string;
  } catch { return null; }
}

function parseKeys(value: string): [number, number, number] | undefined {
  if (!/^\[\s*(?:0x[0-9a-f]+|\d+)\s*,\s*(?:0x[0-9a-f]+|\d+)\s*,\s*(?:0x[0-9a-f]+|\d+)\s*\]$/i.test(value)) return undefined;
  const keys = value.slice(1, -1).split(',').map(part => Number(part.trim()));
  return validKeys(keys) ? keys : undefined;
}

/**
 * Extract data only. Never evaluate, import, or insert downloaded JavaScript.
 * Identifiers and whitespace may change in minified official builds.
 */
export function parseOfficialOnlineJs(source: string, fetchedAt = Date.now()): OfficialOnlineProfiles {
  if (typeof source !== 'string' || new TextEncoder().encode(source).byteLength > MAX_SCRIPT_BYTES) {
    throw new Error('Official Online.js exceeds the configured limit');
  }
  const servers: Record<string, OfficialServerEntry> = Object.create(null);
  const relayField = ['socket', 'Proxy'].join('');
  const fieldPattern = /(?:^|[,{])\s*(["']?)([a-zA-Z_$][\w$]*)\1\s*:\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|0x[0-9a-f]+|\d+)/gi;
  // A server entry is an object within the array assigned by a numeric switch case.
  for (const match of source.matchAll(/\bcase\s+(\d{1,4})\s*:\s*([\s\S]*?)(?=\bcase\s+\d{1,4}\s*:|\bdefault\s*:|\bswitch\s*\(|$)/g)) {
    const object = /=\s*\[\s*\{([\s\S]*?)\}\s*\]/.exec(match[2]!.slice(0, 2400))?.[1];
    if (!object) continue;
    const fields: Record<string, string | number> = Object.create(null);
    fieldPattern.lastIndex = 0;
    for (const part of object.matchAll(fieldPattern)) {
      const raw = part[3]!;
      const value = raw[0] === '"' || raw[0] === "'" ? decodeLiteral(raw) : Number(raw);
      if (value !== null) fields[part[2]!] = value;
    }
    const candidate = {
      address: fields.address,
      port: fields.port,
      version: fields.version,
      langtype: fields.langtype,
      ...(typeof fields[relayField] === 'string' ? { relayEndpoint: fields[relayField] } : {}),
    };
    if (validEntry(candidate)) servers[match[1]!] = candidate;
  }
  if (!Object.keys(servers).length) throw new Error('No official numeric nid server entries found');

  const packetKeysByDate: Record<string, [number, number, number]> = Object.create(null);
  let clientVer3Keys: [number, number, number] | undefined;
  let otherClientVerKeys: [number, number, number] | undefined;
  const cryptIndex = source.indexOf('Network/PacketCrypt');
  if (cryptIndex !== -1) {
    const nextModule = source.indexOf('define(', cryptIndex + 'Network/PacketCrypt'.length);
    const crypt = source.slice(cryptIndex, nextModule === -1 ? cryptIndex + 64_000 : nextModule);
    for (const item of crypt.matchAll(/\b(20\d{6})\s*:\s*(\[\s*(?:0x[0-9a-f]+|\d+)\s*,\s*(?:0x[0-9a-f]+|\d+)\s*,\s*(?:0x[0-9a-f]+|\d+)\s*\])/gi)) {
      const keys = parseKeys(item[2]!);
      if (keys) packetKeysByDate[item[1]!] = keys;
    }
    const ternary = /3\s*={2,3}\s*[a-zA-Z_$][\w$]*\.get\(\s*["']ClientVer["']\s*\)\s*\?\s*(\[[^\]]+\])\s*:\s*(\[[^\]]+\])/i.exec(crypt);
    if (ternary) {
      clientVer3Keys = parseKeys(ternary[1]!);
      otherClientVerKeys = parseKeys(ternary[2]!);
    }
  }
  return {
    schema: 1, fetchedAt, servers, packetKeysByDate,
    ...(clientVer3Keys ? { clientVer3Keys } : {}),
    ...(otherClientVerKeys ? { otherClientVerKeys } : {}),
  };
}

export function resolveOfficialServerProfile(
  profile: AvailableServerProfile,
  snapshot: OfficialOnlineProfiles | null = readOfficialOnlineProfiles(),
): AvailableServerProfile {
  const latest = snapshot?.servers[String(profile.lastroNid)];
  if (!latest || !validEntry(latest)) return profile;
  const keys = profile.clientVer === 3 ? snapshot?.clientVer3Keys : snapshot?.otherClientVerKeys;
  return Object.freeze({
    ...profile,
    loginAddress: latest.address,
    loginPort: latest.port,
    version: latest.version,
    langtype: latest.langtype,
    ...(latest.relayEndpoint ? { relayEndpoint: latest.relayEndpoint } : {}),
    packetKeys: Object.freeze(validKeys(keys) ? [...keys] as [number, number, number] : [...profile.packetKeys] as [number, number, number]),
  });
}

let refreshInFlight: Promise<void> | undefined;

/** Best effort; startup and login must never wait for this operation. */
export function refreshOfficialOnlineProfiles(options: {
  fetcher?: typeof fetch;
  storage?: Pick<Storage, 'setItem'>;
} = {}): Promise<void> {
  if (refreshInFlight && !options.fetcher) return refreshInFlight;
  const task = (async () => {
    const fetcher = options.fetcher ?? createDirectHttpFetch({
      maxBodyBytes: MAX_SCRIPT_BYTES,
      allowOfficialProfileScript: true,
      openTimeoutMs: 5_000,
      readTimeoutMs: 5_000,
    });
    const response = await fetcher(OFFICIAL_SOURCE);
    if (!response.ok) throw new Error('Official server config request failed');
    const text = await response.text();
    const parsed = parseOfficialOnlineJs(text);
    (options.storage ?? globalThis.localStorage)?.setItem(CACHE_KEY, JSON.stringify(parsed));
  })();
  if (!options.fetcher) {
    refreshInFlight = task;
    void task.finally(() => { if (refreshInFlight === task) refreshInFlight = undefined; }).catch(() => undefined);
  }
  return task;
}
