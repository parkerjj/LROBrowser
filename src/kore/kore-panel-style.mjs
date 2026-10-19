// Global styles for the independent fullscreen overlay and debug page. The
// small-window styles live in the LastROTools Shadow DOM stylesheet.

export const KORE_PANEL_STYLE_ID = 'kore-panel-global-style';

export const KORE_PANEL_CSS = `
.kore-fullscreen, .kore-debug { box-sizing:border-box; color:#d6dbe1; font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
.kore-fullscreen { position:fixed; inset:0; z-index:2147483000; display:flex; flex-direction:column; background:#0a0b0d; opacity:0; transition:opacity 200ms ease-out; }
.kore-fullscreen.is-ready { opacity:1; }
.kore-fullscreen.is-leaving { opacity:0; transition-duration:150ms; }
.kore-fullscreen.is-entering::after { content:""; position:absolute; inset:0; pointer-events:none; z-index:5; background:linear-gradient(180deg,transparent 0%,rgba(111,179,201,.18) 50%,transparent 100%); animation:kore-fs-scan 420ms ease-out; }
@keyframes kore-fs-scan { from{transform:translateY(-100%)} to{transform:translateY(100%)} }
.kore-fs-titlebar { position:relative; flex:0 0 34px; height:34px; display:flex; align-items:center; justify-content:center; border-bottom:1px solid #232a31; background:#0d1014; }
.kore-fs-exit { position:absolute; right:10px; top:6px; height:22px; padding:0 10px; border:1px solid #3a4650; border-radius:3px; background:#11161b; color:#c5ced6; font:11px/20px ui-monospace,monospace; cursor:pointer; }
.kore-fs-exit:hover { border-color:#6fb3c9; color:#e8edf2; }
.kore-mode-switch { display:flex; gap:2px; padding:2px; border:1px solid #2a333c; border-radius:999px; background:#07090b; }
.kore-mode-option { height:20px; padding:0 14px; border:0; border-radius:999px; background:transparent; color:#7f8a96; font:500 11px/20px Arial,'Microsoft YaHei','MiSans',sans-serif; cursor:pointer; white-space:nowrap; }
.kore-mode-option.is-active { background:#6fb3c9; color:#061014; }
.kore-mode-option:focus-visible { outline:1px solid #6fb3c9; outline-offset:1px; }
.kore-fs-body { flex:1 1 auto; min-height:0; display:grid; grid-template-columns:minmax(0,65%) minmax(0,35%); }
.kore-fs-left { min-width:0; min-height:0; display:flex; flex-direction:column; border-right:1px solid #232a31; }
.kore-fs-right { min-width:0; min-height:0; display:flex; flex-direction:column; }
.kore-fs-pane { min-width:0; min-height:0; display:flex; flex-direction:column; }
.kore-fs-status { flex:0 0 auto; padding:8px 12px; border-bottom:1px solid #232a31; }
.kore-fs-heading { margin:0 0 6px; color:#6fb3c9; font:600 10px/1.2 ui-monospace,monospace; letter-spacing:.12em; }
.kore-fs-status-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:2px 18px; }
.kore-fs-status-row { display:grid; grid-template-columns:64px minmax(0,1fr); gap:6px; min-width:0; }
.kore-fs-status-label { color:#7f8a96; }
.kore-fs-status-value { color:#d6dbe1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.kore-fs-console { flex:1 1 auto; padding:8px 12px 10px; }
.kore-fs-console-body { flex:1 1 auto; min-height:0; overflow:auto; border-top:1px solid #232a31; border-bottom:1px solid #232a31; padding:4px 0; background:#07090b; }
.kore-fs-console-body .kore-console-line { white-space:pre; }
.kore-fs-console .kore-command { flex:0 0 auto; }
.kore-fs-map { flex:0 0 42%; padding:8px 10px; border-bottom:1px solid #232a31; }
.kore-fs-note { margin-bottom:4px; color:#7f8a96; font-size:10px; }
.kore-fs-canvas { flex:1 1 auto; min-height:0; width:100%; background:#05070a; border:1px solid #232a31; image-rendering:pixelated; }
.kore-fs-tabs { flex:1 1 auto; padding:8px 10px; }
.kore-fs-tabs-header { display:flex; gap:3px; flex:none; }
.kore-fs-tab, .kore-fs-filter { height:22px; padding:0 9px; border:1px solid #2a333c; border-radius:3px; background:#11161b; color:#9aa6b2; font:10px/20px ui-monospace,monospace; cursor:pointer; }
.kore-fs-tab.is-active, .kore-fs-filter.is-active { border-color:#6fb3c9; color:#e8edf2; background:#162028; }
.kore-fs-filters { display:flex; gap:3px; margin-top:5px; flex:none; }
.kore-fs-tab-content { flex:1 1 auto; min-height:0; margin-top:6px; overflow:auto; }
.kore-fs-table { width:100%; border-collapse:collapse; font:11px/1.5 ui-monospace,monospace; white-space:pre; }
.kore-fs-table th { position:sticky; top:0; padding:2px 6px; border-bottom:1px solid #2a333c; background:#0d1014; color:#6fb3c9; text-align:left; font-weight:500; }
.kore-fs-table td { padding:1px 6px; border-bottom:1px solid #151a1f; color:#c5ced6; }
.kore-fs-table tbody tr:hover { background:#11161b; cursor:pointer; }
.kore-fs-table.is-error, pre.is-error { color:#e06060; }
.kore-fs-table pre { margin:0; color:#c5ced6; }
.kore-fs-debug { position:absolute; right:12px; bottom:10px; height:22px; padding:0 10px; border:1px solid #3a4650; border-radius:3px; background:#11161b; color:#7f8a96; font:10px/20px ui-monospace,monospace; cursor:pointer; z-index:4; }
.kore-fs-debug:hover { color:#6fb3c9; border-color:#6fb3c9; }
.kore-debug { position:fixed; inset:0; z-index:2147483100; display:flex; flex-direction:column; background:#07090b; }
.kore-debug[hidden] { display:none !important; }
.kore-debug-header { flex:0 0 34px; display:flex; align-items:center; gap:10px; padding:0 12px; border-bottom:1px solid #232a31; background:#0d1014; }
.kore-debug-title { color:#6fb3c9; font:600 11px/1 ui-monospace,monospace; letter-spacing:.12em; }
.kore-debug-tabs { display:flex; gap:3px; flex:1; }
.kore-debug-tab { height:22px; padding:0 9px; border:1px solid #2a333c; border-radius:3px; background:#11161b; color:#9aa6b2; font:10px/20px ui-monospace,monospace; cursor:pointer; }
.kore-debug-tab.is-active { border-color:#6fb3c9; color:#e8edf2; }
.kore-debug-close { height:22px; padding:0 10px; border:1px solid #3a4650; border-radius:3px; background:#11161b; color:#c5ced6; font:10px/20px ui-monospace,monospace; cursor:pointer; }
.kore-debug-body { flex:1 1 auto; min-height:0; overflow:auto; padding:10px 12px; }
.kore-debug-pane { display:flex; flex-direction:column; gap:8px; min-height:0; }
.kore-debug-pane[hidden] { display:none !important; }
.kore-debug-pre { margin:0; padding:8px; border:1px solid #232a31; background:#05070a; color:#c5ced6; font:11px/1.5 ui-monospace,monospace; white-space:pre-wrap; overflow:auto; }
.kore-debug-note { color:#d8b84a; font-size:11px; }
.kore-debug-select, .kore-debug-editor { box-sizing:border-box; width:100%; border:1px solid #2a333c; border-radius:3px; background:#0d1115; color:#d6dbe1; font:11px/1.5 ui-monospace,monospace; padding:4px 6px; }
.kore-debug-editor { min-height:220px; resize:vertical; }
.kore-debug-actions { display:flex; flex-wrap:wrap; gap:5px; }
.kore-debug .kore-button { height:22px; padding:0 9px; border:1px solid #2a333c; border-radius:3px; background:#11161b; color:#c5ced6; font:10px/20px ui-monospace,monospace; cursor:pointer; }
.kore-debug .kore-button:hover { border-color:#6fb3c9; }
@media (prefers-reduced-motion: reduce) { .kore-fullscreen { transition:none; } .kore-fullscreen.is-entering::after { display:none; } }
`;

export function ensureKorePanelStyle(page = globalThis) {
  const document = page?.document;
  if (!document?.head || document.getElementById?.(KORE_PANEL_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = KORE_PANEL_STYLE_ID;
  style.textContent = KORE_PANEL_CSS;
  document.head.append(style);
}
