import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import console from 'node:console';
import { appendFileSync } from 'node:fs';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

// 定时归档官方 Online.js：下载 → 比较 hash → 仅在内容变化时落盘原件，并生成按 AMD 模块拆分的美化版供 diff。
// 只解析、格式化下载内容，从不执行；输出路径全部经过清洗，不会写出归档目录。
export const ONLINE_JS_URL = 'https://game.lastro.cn/ro/Online.js';
export const PRETTIER_VERSION = '3.9.10';
const MIN_BYTES = 1_000_000;
const MAX_BYTES = 50_000_000;
const ARCHIVE_NAME = /^onlinejs-(\d{10})-([0-9a-f]{12})\.js$/;

export const shortHash = (bytes) => createHash('sha256').update(bytes).digest('hex').slice(0, 12);

export function buildArchiveName(date, hash) {
  const stamp = date.toISOString().slice(0, 13).replace(/\D/g, '');
  return `onlinejs-${stamp}-${hash}.js`;
}

/** 返回文件名时间戳最新的归档 hash；与「最新一份」比较，回滚到旧版本同样会被记录。 */
export function latestArchivedHash(fileNames) {
  const matches = fileNames.map((name) => ARCHIVE_NAME.exec(name)).filter(Boolean);
  matches.sort((a, b) => a[1].localeCompare(b[1]));
  return matches.at(-1)?.[2] ?? null;
}

export async function downloadOnlineJs(url = ONLINE_JS_URL, { fetchImpl = globalThis.fetch } = {}) {
  const response = await fetchImpl(url, { signal: globalThis.AbortSignal.timeout(120_000) });
  if (response.status !== 200) throw new Error(`unexpected HTTP ${response.status} for ${url}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length < MIN_BYTES || bytes.length > MAX_BYTES) throw new Error(`suspicious Online.js size: ${bytes.length} bytes`);
  return bytes;
}

export function formatWithPrettier(bytes) {
  const result = spawnSync('npx', ['--yes', `prettier@${PRETTIER_VERSION}`, '--no-config', '--parser', 'babel'], {
    input: bytes, cwd: os.tmpdir(), maxBuffer: 256 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(`prettier failed: ${result.error?.message ?? result.stderr?.toString().slice(0, 500)}`);
  return result.stdout.toString('utf8');
}

function moduleFile(name) {
  const segments = name.split('/').map((s) => s.replace(/[^A-Za-z0-9_.-]/g, '_')).filter((s) => s && s !== '.' && s !== '..');
  return `${segments.join('/') || '_unnamed'}.js`;
}

/**
 * 按顶层语句拆分美化后的代码：每个具名 define(...) 一个文件，其余顶层代码（运行时、第三方库）按相邻合并为 _other-NNN.js。
 * Prettier 输出的顶层语句必然顶格，续行都带缩进或以 } ) ] 开头，因此无需 AST。返回 [{ file, text }]，拼接后与输入逐字节一致。
 */
export function splitModules(prettyText) {
  const lines = prettyText.replace(/\n$/, '').split('\n');
  const starts = lines.flatMap((line, i) => (line && !' \t})]'.includes(line[0]) ? [i] : []));
  if (starts[0] !== 0) starts.unshift(0);
  const chunks = [];
  let others = 0;
  const used = new Set();
  starts.forEach((start, k) => {
    const text = `${lines.slice(start, starts[k + 1] ?? lines.length).join('\n')}\n`;
    const name = /^define\(\s*"([^"]+)"/.exec(lines.slice(start, start + 2).join('\n'))?.[1];
    if (name === undefined) {
      const last = chunks.at(-1);
      if (last?.other) { last.text += text; return; }
      chunks.push({ other: true, file: `_other-${String(++others).padStart(3, '0')}.js`, text });
      return;
    }
    let file = moduleFile(name);
    for (let n = 2; used.has(file); n++) file = `${moduleFile(name).slice(0, -3)}~${n}.js`;
    used.add(file);
    chunks.push({ file, text });
  });
  return chunks.map(({ file, text }) => ({ file, text }));
}

export async function archiveOnlineJs({ archiveDir, url = ONLINE_JS_URL, now = new Date(), download = downloadOnlineJs, format = formatWithPrettier }) {
  const bytes = await download(url);
  const hash = shortHash(bytes);
  if (latestArchivedHash(await readdir(archiveDir)) === hash) return { changed: false, hash };
  const name = buildArchiveName(now, hash);
  await writeFile(path.join(archiveDir, name), bytes);
  // 原件已落盘；美化失败只影响 diff 视图，由调用方报错，不应丢掉这一份归档。
  try {
    const modules = splitModules(await format(bytes));
    const root = path.join(archiveDir, 'modules');
    await rm(root, { recursive: true, force: true });
    for (const { file, text } of modules) {
      await mkdir(path.dirname(path.join(root, file)), { recursive: true });
      await writeFile(path.join(root, file), text);
    }
    return { changed: true, hash, name, modules: modules.length };
  } catch (formatError) {
    return { changed: true, hash, name, formatError };
  }
}

if (process.argv[1]?.endsWith('archive-online-js.mjs')) {
  const archiveDir = process.argv[2];
  if (!archiveDir) throw new Error('usage: archive-online-js.mjs <archive-dir>');
  const result = await archiveOnlineJs({ archiveDir });
  console.log(JSON.stringify({ ...result, formatError: result.formatError?.message }));
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${result.changed}\nname=${result.name ?? ''}\n`);
  if (result.formatError) {
    console.error(`::error::Online.js 已归档但美化失败：${result.formatError.message}`);
    process.exitCode = 1;
  }
}
