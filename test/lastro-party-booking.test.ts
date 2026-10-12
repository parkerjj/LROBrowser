import { describe, it, expect, vi } from 'vitest';
import {
  partyWebPath, decodePartyText, normalizePartyEntry, makePartyFields, requestParty,
} from '../src/assistant/lro-party-booking.mjs';

const session = Object.freeze({
  AuthToken: 'session-token', AID: 23, GID: 456,
  Entity: { GID: 123, GUID: 789 },
});
const listing = {
  AID: 23, GID: 456, IID: 15, Type: 1, ISTATE: 0,
  CharName: '%E6%B5%8B%E8%AF%95', Memo: '%E5%89%AF%E6%9C%AC', WorldName: 'lastro',
  MinLV: 100, MaxLV: 200,
};

describe('LastRO recruitment protocol', () => {
  it('uses official HTTP paths for ClientVer 5 and other clients', () => {
    expect(partyWebPath(5)).toBe('webserver2');
    expect(partyWebPath(3)).toBe('webserver');
    expect(partyWebPath(6)).toBe('webserver');
  });

  it('decodes UTF-8, GBK and already decoded text', () => {
    expect(decodePartyText('%E6%B5%8B%E8%AF%95')).toBe('测试');
    expect(decodePartyText('%B2%E2%CA%D4')).toBe('测试');
    expect(decodePartyText('冒险者%20募集')).toBe('冒险者 募集');
  });

  it('normalizes the server entry without trusting HTML content', () => {
    expect(normalizePartyEntry(listing)).toMatchObject({
      aid: 23, cid: 456, iid: 15, type: 1, state: 0,
      min: 100, max: 200, name: '测试', memo: '副本',
    });
    expect(normalizePartyEntry({ AID: 'invalid', GID: 20 })).toBeNull();
  });

  it('uses entity GID for list/get/info/del and AID for add/search', () => {
    for (const action of ['list', 'get', 'info', 'del']) {
      const form = makePartyFields(session, action, { QueryAID: 999 });
      expect(form.get('AID')).toBe('123');
      expect(form.get('GDID')).toBe('789');
      expect(form.get('WorldName')).toBe('lastro');
      if (action === 'info') expect(form.get('QueryAID')).toBe('999');
    }
    const form = makePartyFields(session, 'add', {
      Type: 1, CharName: '骑士', IID: 7, MinLV: 150, MaxLV: 200, Memo: '招人', ISTATE: 1,
    }, value => 'ENC(' + value + ')');
    expect(form.get('AID')).toBe('23');
    expect(form.get('GID')).toBe('456');
    expect(form.get('Assist')).toBe('1');
    expect(form.get('Dealer')).toBe('1');
    expect(form.get('Healer')).toBe('1');
    expect(form.get('Tanker')).toBe('1');
    expect(form.get('IID')).toBe('7');
    expect(form.get('Memo')).toBe('ENC(招人)');
  });

  it('refuses unauthenticated requests, unknown actions, and HTTP failures', async () => {
    expect(() => makePartyFields({}, 'list')).toThrow();
    const fetch = vi.fn(async () => ({ ok: false, status: 403 }));
    await expect(requestParty({ fetch }, session, 5, 'list')).rejects.toThrow('HTTP 403');
    expect(fetch.mock.calls[0][0]).toBe('https://game.lastro.cn/webserver2/party/list');
    expect(fetch.mock.calls[0][1].credentials).toBe('include');
    await expect(requestParty({ fetch }, session, 5, 'unknown')).rejects.toThrow('未知募集操作');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('passes server JSON through without inventing a successful registration', async () => {
    const fetch = vi.fn(async () => ({ ok: true, json: async () => ({ Type: 0 }) }));
    const result = await requestParty({ fetch }, session, 3, 'add',
      { CharName: 'test', IID: 9, Type: 1, Memo: 'abc' });
    expect(result.Type).toBe(0);
    expect(fetch.mock.calls[0][0]).toBe('https://game.lastro.cn/webserver/party/add');
  });
});
