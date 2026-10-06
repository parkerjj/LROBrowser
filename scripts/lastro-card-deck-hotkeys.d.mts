interface ShortcutBinding {
  key: number | string;
  alt: boolean;
  ctrl: boolean;
  shift: boolean;
}
interface ShortcutAction {
  init: ShortcutBinding;
  cust: ShortcutBinding | false;
  component: string;
  cmd: string;
}
interface CardShortcutComponent {
  onShortCut?: (binding: { cmd: string }) => unknown;
  switchDeckPreset?: (index: number, options?: { requireVerified?: boolean }) => unknown;
}
export function installLastroCardDeckHotkeyPreferences(controls: { ShortCuts: Record<string, ShortcutAction> }): void;
export function installLastroCardDeckShortcutDispatch(component: CardShortcutComponent, options: {
  getActiveElement: () => Element | null;
  isCapturing: () => boolean;
  getChatRoot?: () => Element | ShadowRoot | null | undefined;
}): void;
export function patchRuntimeCardDeckHotkeys(source: string): string;
