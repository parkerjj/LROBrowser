export interface LastroCardStateRow {
  cards: number[];
  recharge: number[];
  activate?: number;
  effect?: string;
}
export interface LastroCardStateData {
  enable?: number;
  data: Record<number, { enable?: number; data: Record<number, LastroCardStateRow> }>;
}
export interface LastroCardStatePacket {
  tab?: unknown;
  level?: unknown;
  cardid?: unknown;
  state?: unknown;
}
export interface LastroCardStateEntry {
  id: number;
  tab: number;
  level: number;
  slot?: number;
  state: number;
  name: string;
  effect?: string;
}
export interface LastroCardStatePresentation {
  badgeText: string;
  badgeKind: string;
  action: {
    action?: string;
    label: string;
    kind?: string;
    tab: number;
    level: number;
    disabled?: boolean;
  };
}
export interface LastroCardStateComponent {
  _data: LastroCardStateData | null;
  _tab: number;
  _level: number;
  _page: number;
  _totalPages: number;
  _filter: string;
  _search: string;
  _lastroCardStateInstalled?: boolean;
  getRoot(): HTMLElement | null;
  cardName(id: number): string;
  createCardNode(entry: LastroCardStateEntry, options: LastroCardStatePresentation & { meta: string }): HTMLElement;
  renderCategory(): DocumentFragment;
  renderCards(): void;
  handleBodyClick(event: Event): void;
  updateList(packet: LastroCardStatePacket): boolean;
  cancelUpdate(packet: LastroCardStatePacket): boolean;
}
export function installLastroCardState(component: LastroCardStateComponent, deps: {
  document: Document;
  getInventory?: () => { list?: ReadonlyArray<{ ITID?: number; type?: number; count?: number }> } | null | undefined;
  CARD_CONNECTION_TABS: ReadonlyArray<{ id: number; label: string }>;
  listCardEntries(data: LastroCardStateData | null, options: {
    tab: number;
    filter: string;
    page: number;
    pageSize: number;
    itemNames(id: number): string;
  }): { entries: LastroCardStateEntry[]; page: number; totalPages: number; total: number };
  resolveCategoryCardAction(entry: LastroCardStateEntry): LastroCardStatePresentation;
}): boolean;
