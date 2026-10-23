export const KORE_RENDER_PREFERENCE: string;
export interface KoreRenderToggle {
  readonly available: boolean;
  readonly enabled: boolean;
  readonly revision: number;
  setEnabled(value: boolean, options?: { persist?: boolean }): boolean;
  applyPreference(): boolean;
  onChange(listener: () => void): () => void;
}
export function createRenderToggle(options?: { page?: Record<string, unknown> }): KoreRenderToggle;
