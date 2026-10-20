import vm from 'node:vm';
import { expect, test } from 'vitest';
import { extractRuntimeNode, readVendorSource } from './helpers/vendor-runtime';

test('native map entry binds the account actor ID and verified character ID separately', () => {
  const source = extractRuntimeNode(readVendorSource(), { region: 'src/Engine/CharEngine.js', kind: 'function', name: 'onReceiveMapInfo' });
  const sessions: unknown[][] = [];
  const maps: unknown[][] = [];
  const context = vm.createContext({
    DB: { isLoaded: true }, retryCount: 0, Configs: { get: (key: string, fallback: unknown) => key === 'lastroNid' ? 3 : fallback },
    SessionStorage_default: { AID: 11001, Entity: { GID: 11001, display: { name: '测试' }, level: 99, joblevel: 50, job: 16 } },
    KoreEngine: { beginGameSession: (...args: unknown[]) => sessions.push(args) },
    MapEngine: { init: (...args: unknown[]) => maps.push(args) },
    packet: { GID: 22002, mapName: 'prt_fild08.gat', addr: { ip: 1, port: 5121 } },
  });
  vm.runInContext(source + '\nonReceiveMapInfo(packet);', context);
  expect(sessions).toEqual([[11001, 'prt_fild08.gat', { aid: 11001, cid: 22002, nid: 3, name: '测试', baseLevel: 99, jobLevel: 50, jobId: 16 }]]);
  expect(maps).toEqual([[1, 5121, 'prt_fild08.gat']]);
});
