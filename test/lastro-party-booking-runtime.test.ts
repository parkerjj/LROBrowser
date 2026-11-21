import { JSDOM } from 'jsdom';
import { describe, expect, it, vi } from 'vitest';
// @ts-expect-error The bundled assistant is JavaScript without type declarations.
import { installLastroPartyBooking } from '../src/assistant/lro-party-booking.mjs';

const listing = {
  AID: 23, GID: 456, IID: 1, Type: 1, ISTATE: 0,
  CharName: 'Party leader', Memo: 'Fixture', WorldName: 'lastro',
};

describe('LastRO instance requests from the recruitment panel', () => {
  function openPanel() {
    const { window: page } = new JSDOM('', { url: 'https://fixture.example/' });
    page.ROConfig = { clientVer: 3 };
    const httpRequest = vi.fn(async (_clientVer: number, action: string) => ({
      Type: action === 'add' ? 1 : undefined,
      data: action === 'list' ? [listing] : action === 'info' ? { ...listing, AID: undefined, GID: undefined } : null,
    }));
    page.LastROPartyHttpRequest = httpRequest;
    const sendPacket = vi.fn();
    class CreateInstance {}
    class EnterInstance {}
    class CreateResult {}
    let receive!: (structure: typeof CreateResult, result: { rs: number }, phase: string) => Promise<void>;
    const modules = new Map<string, unknown>([
      ['Core/Configs', { get: (key: string) => key === 'clientVer' ? 5 : undefined }],
      ['Engine/SessionStorage', {
        AuthToken: 'fixture-token', AID: 123, GID: 789, hasParty: true, isPartyLeader: true,
        Entity: { GID: 123, GUID: 0, display: { name: 'Fixture' } },
      }],
      ['Network/PacketStructure', { CZ: { REQ_CREATE_INSTANCE: CreateInstance, REQ_ENTER_INSTANCE: EnterInstance }, ZC: { RS_CREATE_INSTANCE: CreateResult } }],
      ['Network/NetworkManager', { sendPacket }],
    ]);
    installLastroPartyBooking({ page, modules, subscribePackets: (listener: typeof receive) => { receive = listener; } }).open();
    const confirmCreation = (rs: number) => receive(CreateResult, { rs }, 'after');
    return { page, httpRequest, sendPacket, confirmCreation, shadow: page.document.getElementById('lastro-party-booking')!.shadowRoot! };
  }

  it('queries the currently selected server after a server switch', async () => {
    const { page, httpRequest } = openPanel();
    try {
      await vi.waitFor(() => expect(httpRequest).toHaveBeenCalledWith(5, 'get', expect.anything()));
      expect(httpRequest).toHaveBeenCalledWith(5, 'list', expect.anything());
    } finally { page.close(); }
  });

  it('enters with the recruitment list IDs when the detail response omits them', async () => {
    const { page, httpRequest, sendPacket, shadow } = openPanel();
    try {
      const card = await vi.waitFor(() => {
        const button = shadow.querySelector<HTMLButtonElement>('.card');
        expect(button).not.toBeNull();
        return button!;
      });
      card.click();
      const join = await vi.waitFor(() => {
        const button = [...shadow.querySelectorAll<HTMLButtonElement>('.view-actions button')]
          .find(button => button.textContent === '进入副本');
        expect(button).toBeDefined();
        return button!;
      });
      join.click();
      expect(httpRequest).toHaveBeenCalledWith(5, 'info', expect.anything());
      expect(sendPacket).toHaveBeenCalledWith(expect.objectContaining({ AID: 23, CID: 456, instanceName: '无尽之塔' }));
    } finally { page.close(); }
  });

  it('registers a created instance on the active server only after the game ACK', async () => {
    const { page, httpRequest, sendPacket, confirmCreation, shadow } = openPanel();
    try {
      await vi.waitFor(() => expect(httpRequest).toHaveBeenCalledWith(5, 'get', expect.anything()));
      shadow.querySelector<HTMLButtonElement>('[data-action="create"]')!.click();
      const instance = shadow.querySelector<HTMLSelectElement>('[name="instanceName"]')!;
      instance.value = '无尽之塔';
      instance.dispatchEvent(new page.Event('change'));
      shadow.querySelector<HTMLButtonElement>('[data-action="submit"]')!.click();
      expect(sendPacket).toHaveBeenCalledWith(expect.objectContaining({ instanceName: '无尽之塔' }));
      expect(httpRequest.mock.calls.some(([, action]) => action === 'add')).toBe(false);
      await confirmCreation(1);
      expect(httpRequest).toHaveBeenCalledWith(5, 'add', expect.any(FormData));
    } finally { page.close(); }
  });
});
