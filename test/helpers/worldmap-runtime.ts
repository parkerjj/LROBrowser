import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { extractRuntimeNode, extractVendorRegion, readVendorSource } from './vendor-runtime';

const { JSDOM } = createRequire(import.meta.url)('jsdom') as { JSDOM: new () => { window: Window & typeof globalThis } };

export function initializeWorldMap(runtime: string, native = readVendorSource()) {
  const dom = new JSDOM(), window = dom.window, document = window.document;
  const events: string[] = [];
  const context: Record<string, unknown> = {
    window, document, Event: window.Event, URL, runtimeUrl: 'https://iwa.invalid/runtime/Online.js',
    MouseMode: { STOP: 1, CROSS: 2, FREEZE: 3 },
    DB: { INTERFACE_PATH: '', getBodyPath: (id: number) => 'monster/' + id, getItemInfo: () => ({}) },
    Client: { loadFile: () => { events.push('Client.loadFile'); throw new Error('Unexpected construction resource load'); } },
    UIManager: { addComponent: (component: unknown) => { events.push('register'); return component; }, showPromptBox: () => { events.push('prompt'); } },
    MonsterTable_default: { 1002: 'poring' }, ItemTable_default: {}, SessionStorage_default: { AID: 1 },
    MapRenderer: { currentMap: 'prontera.gat', loading: false },
    Configs: { get: () => { events.push('Configs.get'); return 0; } },
    Thread: { send: () => { events.push('GET_FILE'); } }, Network: { sendPacket: () => { events.push('send'); } }, PACKET: { CZ: {} },
    Navigation_default: {}, normalizeLastROTeleportMap: (map: string) => map.replace(/\.gat$/i, ''),
    buildPrivateAirshipRequest: () => { events.push('packet'); }, showLastroTeleportNotice: () => { events.push('notice'); },
    fetch: () => { events.push('fetch'); throw new Error('Unexpected construction data load'); },
    setTimeout: () => { events.push('timer'); throw new Error('Unexpected construction timer'); }, clearTimeout: () => {},
  };
  for (const name of ['DBManager', 'Client', 'UIManager', 'GUIComponent', 'MonsterTable', 'SessionStorage', 'MapRenderer', 'NetworkManager', 'PacketStructure', 'Navigation', 'Thread', 'Configs']) {
    context['init_' + name] = () => events.push('init_' + name);
  }
  const gui = extractRuntimeNode(native, { region: 'src/UI/GUIComponent.js', kind: 'class', name: 'GUIComponent' });
  const esm = extractRuntimeNode(native, { kind: 'assignment', name: '__esmMin' });
  const source = extractVendorRegion('src/UI/Components/WorldMap/WorldMap.js', runtime);
  if (source.split('import.meta.url').length !== 2) throw new Error('Expected one package URL dependency');
  const component = runInNewContext(`var ${esm}; const GUIComponent = (${gui});
    ${source.replace('import.meta.url', 'runtimeUrl')}
    init_WorldMap(); init_WorldMap(); WorldMap_default;`, context) as {
    name: string; _host: HTMLElement | null; render(): string; _lastroTeleport?: { cancelPending(): void };
    onRemove(): void; updatePartyMembers(packet: { groupInfo: unknown[] }): void; searchMonster(input: unknown): Promise<void>;
  };
  return { component, events, window };
}
