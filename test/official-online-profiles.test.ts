import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  parseOfficialOnlineJs, readOfficialOnlineProfiles, refreshOfficialOnlineProfiles,
  resolveOfficialServerProfile,
} from '../src/servers/online-profile-cache';
import { getAvailableServerProfile } from '../src/servers/server-profiles';

// Representative slices of the minified official Online.js supplied on 2026-10-10.
const officialFixture = String.raw`define("Network/PacketCrypt",["Core/Configs"],function(a){var b=new Uint32Array(3),c=!1,d={20110817:[87907565,1038970349,1844276717],20211103:[1205473515,1267870927,1985761365]},e;return{init:function(){var e;c=!1;e=3==a.get("ClientVer")?[1205481659,453061308,592073252]:[1205481642,453065386,592073252];}}});
define("Engine/Game",[],function(){var F=[];(a=n.get("ClientVer"))||(a=0);switch(a){case 0:F=[{display:"\u7535\u4fe1\u7ebf\u8def",desc:"",address:"192.168.101.89",port:36666,version:45,langtype:3,socketProxy:"ws://192.168.101.89:5999/",adminList:[2000001]}];break;case 1:F=[{display:"\u7535\u4fe1\u7ebf\u8def",desc:"",address:"port.lastro.cn",port:38569,version:45,langtype:3,socketProxy:"wss://port.lastro.cn/",adminList:[2000001]}];break;case 3:F=[{display:"\u7535\u4fe1\u7ebf\u8def",desc:"",address:"103.8.222.164",port:28569,version:45,langtype:3,socketProxy:"wss://port.lastro.cn/",adminList:[2000001]}];break;case 4:F=[{display:"\u7535\u4fe1\u7ebf\u8def",desc:"",address:"port.lastro.cn",port:29569,version:45,langtype:3,socketProxy:"wss://port.lastro.cn/",adminList:[2000001]}];break;case 5:F=[{display:"\u7535\u4fe1\u7ebf\u8def",desc:"",address:"103.8.222.164",port:26569,version:45,langtype:3,socketProxy:"wss://port.lastro.cn/",adminList:[2000001]}]}var G=!1;});
`;
const now = Date.now();

afterEach(() => vi.restoreAllMocks());

describe('official Online.js passive metadata extraction', () => {
  it('parses every nid and the exact ClientVer-dependent keys from minified source', () => {
    const result = parseOfficialOnlineJs(officialFixture, now);
    expect(Object.keys(result.servers)).toEqual(['0', '1', '3', '4', '5']);
    expect(result.servers['3']).toEqual({
      address: '103.8.222.164', port: 28569, version: 45, langtype: 3,
      relayEndpoint: 'wss://port.lastro.cn/',
    });
    expect(result.servers['5']).toMatchObject({ address: '103.8.222.164', port: 26569, langtype: 3 });
    expect(result.servers['0']?.address).toBe('192.168.101.89');
    expect(result.clientVer3Keys).toEqual([1205481659, 453061308, 592073252]);
    expect(result.otherClientVerKeys).toEqual([1205481642, 453065386, 592073252]);
    expect(result.packetKeysByDate['20211103']).toEqual([1205473515, 1267870927, 1985761365]);
  });

  it('supports whitespace, newlines, single-quoted values, and hex numbers', () => {
    const formatted = officialFixture.replace('case 3:F=[{', "case 3:\n F = [ {")
      .replace('address:"103.8.222.164"', "address:'103.8.222.164'")
      .replace('port:28569', 'port:0x6f99');
    // 0x6f99 = 28569
    expect(parseOfficialOnlineJs(formatted).servers['3']).toMatchObject({
      address: '103.8.222.164', port: 28569,
    });
  });

  it('uses official data for matching nid but leaves missing App nid untouched', () => {
    const snapshot = parseOfficialOnlineJs(officialFixture);
    const three = resolveOfficialServerProfile(getAvailableServerProfile('lastro-3x'), snapshot);
    const two = resolveOfficialServerProfile(getAvailableServerProfile('lastro-2x'), snapshot);
    const app = getAvailableServerProfile('lastro-app');
    expect(three).toMatchObject({ loginAddress: '103.8.222.164', loginPort: 28569, langtype: 3 });
    expect(two).toMatchObject({ loginAddress: '103.8.222.164', loginPort: 26569, langtype: 3 });
    expect(two.packetKeys).toEqual([1205481642, 453065386, 592073252]);
    expect(resolveOfficialServerProfile(app, snapshot)).toBe(app);
    expect(Object.isFrozen(two.packetKeys)).toBe(true);
  });

  it('accepts a full valid cache and rejects malformed, expired, or suspicious data', () => {
    let value = JSON.stringify(parseOfficialOnlineJs(officialFixture));
    const storage = { getItem: () => value };
    expect(readOfficialOnlineProfiles(storage)?.servers['1']?.port).toBe(38569);
    value = JSON.stringify({ ...JSON.parse(value), fetchedAt: Date.now() - 91 * 86_400_000 });
    expect(readOfficialOnlineProfiles(storage)).toBeNull();
    value = JSON.stringify({ ...parseOfficialOnlineJs(officialFixture), servers: {
      3: { address: 'https://other.test/path', port: 28569, version: 45, langtype: 3 },
    } });
    expect(readOfficialOnlineProfiles(storage)).toBeNull();
    value = 'invalid-json';
    expect(readOfficialOnlineProfiles(storage)).toBeNull();
  });

  it('replaces the cache only after successfully parsing official data', async () => {
    const setItem = vi.fn();
    const fetcher = vi.fn(async () => new Response(officialFixture));
    await refreshOfficialOnlineProfiles({ fetcher, storage: { setItem } });
    expect(fetcher).toHaveBeenCalledWith(new URL('https://game.lastro.cn/ro/Online.js'));
    expect(setItem).toHaveBeenCalledOnce();
    expect(JSON.parse(setItem.mock.calls[0]![1]).servers['3'].port).toBe(28569);

    const failed = vi.fn(async () => new Response('<html>invalid</html>'));
    await expect(refreshOfficialOnlineProfiles({ fetcher: failed, storage: { setItem } })).rejects.toThrow('No official');
    expect(setItem).toHaveBeenCalledOnce();
  });

  it('rejects a missing server table or a script exceeding the safety limit', () => {
    expect(() => parseOfficialOnlineJs('define("Network/PacketCrypt",[],()=>{});')).toThrow('No official');
    expect(() => parseOfficialOnlineJs('x'.repeat(4 * 1024 * 1024 + 1))).toThrow('limit');
  });
});
