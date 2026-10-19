export function installLastroToolsPanels(
  tools: Record<string, unknown>,
  deps: Record<string, unknown>,
  css: string,
  presetRoutes?: Record<string, unknown>,
): unknown;

export function installKoreShellPanels(
  tools: Record<string, unknown>,
  deps: Record<string, unknown>,
): { setMode(mode: 'lastro' | 'kore'): void; readonly mode: 'lastro' | 'kore' };
