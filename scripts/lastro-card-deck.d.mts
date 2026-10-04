import type { LastroCardStateData, LastroCardStatePacket } from './lastro-card-state.mjs';
export interface LastroCardDeckDefinition { id: number; tab: number; level: number; }
export interface LastroCardDeckPreferences {
  presets: Array<LastroCardDeckDefinition[] | null>;
  activePreset: number | null;
  activeCards?: LastroCardDeckDefinition[] | null;
  verifiedCards?: Array<LastroCardDeckDefinition[] | null>;
  names?: string[];
  save(): Promise<boolean | void> | boolean | void;
}
export interface LastroCardDeckAPI {
  getPresets(): Array<number[] | null>;
  getNames(): string[];
  getDraft(index?: number): LastroCardDeckDefinition[];
  isDirty(index?: number): boolean;
  isVerified(index: number): boolean;
  getAvailableCards(): Array<LastroCardDeckDefinition & { state: number }>;
  getCardState(card: LastroCardDeckDefinition): number;
  getCardDefinition(id: number): (LastroCardDeckDefinition & { state: number }) | null;
  getEquipmentTab(card: LastroCardDeckDefinition): number | null;
  getSelected(): number;
  getActivePreset(): number | null;
  isBusy(): boolean;
  canEdit(index?: number): boolean;
  canSave(index?: number): boolean;
  isActive(cards: number[]): boolean;
  invalidate(reset?: boolean): void;
  onServerNotice(message: unknown): boolean;
}
export function installLastroCardDeck(component: {
  _data: LastroCardStateData | null;
  renderCards(): void;
  setStatus(message: string): void;
  sendAction(action: string, values: object): boolean;
  rechargeList(packet: object): boolean;
  updateList(packet: LastroCardStatePacket): boolean;
  cancelUpdate(packet: LastroCardStatePacket): boolean;
}, deps: {
  getSession(): { key: string | null; connection: object | null; playing: boolean };
  getDefaults(): LastroCardStateData;
  loadPreferences(key: string): LastroCardDeckPreferences;
  setTimeout: typeof globalThis.setTimeout;
  clearTimeout: typeof globalThis.clearTimeout;
  notify?(success: boolean, index: number, name: string, reason?: string): void;
}): LastroCardDeckAPI;
