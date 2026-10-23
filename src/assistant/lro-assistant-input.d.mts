export function installAssistantInputTracking(win: Window): void;
export function isAssistantInput(event: Event): boolean;
export function addAssistantAwareListener(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
export function removeAssistantAwareListener(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void;
export function guardAssistantInputHandler(listener: EventListenerOrEventListenerObject): EventListener;
export function guardAssistantInputHandler(listener: null): null;
export function bindAssistantNativeCursor(host: HTMLElement, page: Window, GUIComponent: unknown): void;
