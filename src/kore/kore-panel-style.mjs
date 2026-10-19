// Global styles for the independent fullscreen overlay and debug page. The
// small-window styles live in the LastROTools Shadow DOM stylesheet.

export const KORE_PANEL_STYLE_ID = 'kore-panel-global-style';

export const KORE_PANEL_CSS = `
.kore-fullscreen, .kore-debug { box-sizing:border-box; color:#ffffff; font:13px/1.5 Arial,'Microsoft YaHei','MiSans',system-ui,sans-serif; }
.kore-fullscreen { position:fixed; inset:0; z-index:2147483000; display:flex; flex-direction:column; background:#171719; opacity:0; transition:opacity 180ms ease-out; }
.kore-fullscreen.is-ready { opacity:1; }
.kore-fullscreen.is-leaving { opacity:0; transition-duration:140ms; }
.kore-fs-bar { flex:0 0 48px; display:flex; align-items:center; justify-content:space-between; padding:0 24px; border-bottom:1px solid #222224; }
.kore-fs-brand { display:flex; align-items:center; gap:10px; }
.kore-fs-mark { flex:none; width:12px; height:12px; background:#6fb3c9; clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%); }
.kore-fs-title { color:#ffffff; font:600 14px/1 Arial,'Microsoft YaHei','MiSans',sans-serif; }
.kore-fs-bar-actions, .kore-fs-head-actions { display:flex; align-items:center; gap:8px; flex:none; }
.kore-fs-btn { display:inline-flex; align-items:center; gap:8px; height:32px; padding:0 14px; border:1px solid #3a3a3e; border-radius:6px; background:transparent; color:#ffffff; font:500 13px/1 Arial,'Microsoft YaHei','MiSans',sans-serif; white-space:nowrap; transition:border-color 120ms ease-out,background-color 120ms ease-out,color 120ms ease-out; }
.kore-fs-btn:hover { border-color:#6a6a70; }
.kore-fs-btn:focus-visible { outline:1px solid #6fb3c9; outline-offset:2px; }
.kore-fs-btn:disabled { border-color:#2a2a2e; color:#8a8c92; }
.kore-fs-btn:disabled { cursor:default !important; }
.kore-fs-btn-primary { border-color:#ffffff; background:#ffffff; color:#111111; }
.kore-fs-btn-primary:hover { border-color:#e6e6ea; background:#e6e6ea; }
.kore-fs-btn-primary:disabled { border-color:#3a3a3e; background:transparent; color:#8a8c92; }
.kore-fs-btn-text { border-color:transparent; color:#8a8c92; }
.kore-fs-btn-text:hover { border-color:transparent; color:#ffffff; }
.kore-fs-hint { color:#8a8c92; font-size:12px; font-weight:400; }
.kore-fs-main { flex:1 1 auto; min-height:0; display:flex; flex-direction:column; gap:16px; padding:20px 24px 24px; }
.kore-fs-head { flex:none; display:flex; align-items:flex-start; justify-content:space-between; gap:24px; }
.kore-fs-id { min-width:0; }
.kore-fs-id-line { display:flex; align-items:center; flex-wrap:wrap; gap:4px 12px; min-width:0; }
.kore-fs-name { margin:0; color:#ffffff; font:600 24px/1.2 Arial,'Microsoft YaHei','MiSans',sans-serif; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.kore-fs-job { color:#8a8c92; font-size:14px; white-space:nowrap; }
.kore-fs-pill { flex:none; height:20px; padding:0 8px; border-radius:10px; font:500 12px/20px Arial,'Microsoft YaHei','MiSans',sans-serif; white-space:nowrap; }
.kore-fs-pill:empty { display:none; }
.kore-fs-pill[data-mode="AUTO"] { background:rgba(95,195,156,.14); color:#5fc39c; }
.kore-fs-pill[data-mode="OFF"] { background:#212023; color:#b4b4b4; }
.kore-fs-finding { margin:6px 0 0; color:#b4b4b4; font-size:14px; line-height:1.4; }
.kore-fs-grid { flex:1 1 auto; min-height:0; display:grid; grid-template-columns:320px minmax(0,1fr) 380px; gap:16px; }
.kore-fs-col { min-width:0; min-height:0; display:flex; flex-direction:column; gap:16px; }
.kore-fs-card { min-width:0; min-height:0; display:flex; flex-direction:column; padding:16px; border:1px solid #222224; border-radius:8px; background:#131217; }
.kore-fs-card-head { flex:none; display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin-bottom:12px; }
.kore-fs-card-title { margin:0; color:#ffffff; font:600 14px/1.2 Arial,'Microsoft YaHei','MiSans',sans-serif; }
.kore-fs-meta { color:#8a8c92; font-size:12px; font-variant-numeric:tabular-nums; }
.kore-fs-status { flex:none; }
.kore-fs-gauge { display:grid; grid-template-columns:24px minmax(0,1fr) auto; align-items:center; gap:10px; }
.kore-fs-gauge + .kore-fs-gauge { margin-top:12px; }
.kore-fs-gauge-label { color:#8a8c92; font-size:13px; }
.kore-fs-gauge-track { height:6px; border-radius:3px; background:#212023; overflow:hidden; }
.kore-fs-gauge-fill { display:block; width:0; height:100%; background:#6fb3c9; transition:width 160ms ease-out; }
.kore-fs-gauge-hp .kore-fs-gauge-fill { background:#44a282; }
.kore-fs-gauge-fill[data-level="warn"] { background:#d9a441; }
.kore-fs-gauge-fill[data-level="crit"] { background:#e5566f; }
.kore-fs-gauge-value { min-width:128px; text-align:right; color:#ffffff; font-size:13px; font-variant-numeric:tabular-nums; white-space:nowrap; }
.kore-fs-kv { display:grid; grid-template-columns:auto minmax(0,1fr); gap:0 16px; margin:16px 0 0; }
.kore-fs-kv dt { color:#8a8c92; font-size:13px; line-height:28px; }
.kore-fs-kv dd { margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:right; color:#ffffff; font-size:13px; line-height:28px; font-variant-numeric:tabular-nums; }
.kore-fs-tabs { flex:1 1 auto; padding:0; }
.kore-fs-tabs-header { flex:none; display:flex; gap:20px; padding:0 16px; border-bottom:1px solid #222224; }
.kore-fs-tab { position:relative; padding:0; border:0; background:none; color:#8a8c92; font:500 13px/44px Arial,'Microsoft YaHei','MiSans',sans-serif; white-space:nowrap; transition:color 120ms ease-out; }
.kore-fs-tab:hover, .kore-fs-tab.is-active { color:#ffffff; }
.kore-fs-tab:focus-visible { outline:1px solid #6fb3c9; outline-offset:2px; }
.kore-fs-tab.is-active::after { content:''; position:absolute; left:0; right:0; bottom:-1px; height:1px; background:#6fb3c9; }
.kore-fs-tab-content { flex:1 1 auto; min-height:0; overflow:auto; padding:0 16px 8px; }
.kore-fs-search { flex:none; padding:12px 16px 4px; }
.kore-fs-search[hidden] { display:none; }
.kore-fs-search-input { width:100%; height:28px; font-size:12px; line-height:26px; }
.kore-fs-group-head { display:flex; align-items:center; gap:8px; width:100%; height:32px; padding:0; border:0; background:none; color:#8a8c92; font:500 12px/1 Arial,'Microsoft YaHei','MiSans',sans-serif; text-align:left; transition:color 120ms ease-out; }
.kore-fs-group-head:hover { color:#ffffff; }
.kore-fs-group-head:focus-visible { outline:1px solid #6fb3c9; outline-offset:2px; }
.kore-fs-group-label { flex:1 1 auto; }
.kore-fs-chevron { flex:none; width:6px; height:6px; border-right:1.5px solid currentColor; border-bottom:1.5px solid currentColor; transform:rotate(45deg) translate(-1px,-1px); transition:transform 120ms ease-out; }
.kore-fs-group.is-collapsed .kore-fs-chevron { transform:rotate(-45deg); }
.kore-fs-item, .kore-fs-slot { display:flex; align-items:center; justify-content:space-between; gap:12px; min-height:32px; border-bottom:1px solid #1b1a1f; }
.kore-fs-item-name { display:flex; align-items:center; gap:8px; min-width:0; color:#ffffff; font-size:13px; }
.kore-fs-item-text { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.kore-fs-item-qty { flex:none; color:#ffffff; font-size:13px; font-variant-numeric:tabular-nums; text-align:right; }
.kore-fs-slots { padding-top:4px; }
.kore-fs-slot { justify-content:flex-start; }
.kore-fs-slot-label { flex:none; width:56px; color:#8a8c92; font-size:12px; }
.kore-fs-slot.is-empty .kore-fs-item-name { color:#8a8c92; }
.kore-fs-pill-bad { flex:none; height:18px; padding:0 6px; background:rgba(229,86,111,.14); color:#e5566f; font-size:11px; line-height:18px; }
.kore-fs-earn { padding-top:16px; }
.kore-fs-earn-head { display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin-bottom:4px; }
.kore-fs-earn-title { margin:0; color:#ffffff; font:600 13px/1.2 Arial,'Microsoft YaHei','MiSans',sans-serif; }
.kore-fs-earn-track { display:block; margin:8px 0 4px; }
.kore-fs-kv-tight { margin:0; }
.kore-fs-empty { padding:28px 0; color:#8a8c92; font-size:13px; text-align:center; }
.kore-fs-map { flex:none; }
/* The map shrinks on short screens so the quick commands below it stay fully visible. */
.kore-fs-map-stage { position:relative; flex:none; width:min(100%,max(150px,calc(100vh - 520px))); aspect-ratio:1 / 1; margin-inline:auto; }
.kore-fs-canvas { position:absolute; inset:0; display:block; width:100%; height:100%; }
.kore-fs-map-empty { position:absolute; inset:0; display:grid; place-items:center; padding:0; }
.kore-fs-map-empty[hidden] { display:none; }
.kore-fs-legend { flex:none; display:flex; flex-wrap:wrap; gap:6px 14px; margin-top:12px; color:#8a8c92; font-size:12px; }
.kore-fs-legend-item { display:inline-flex; align-items:center; gap:6px; white-space:nowrap; }
.kore-fs-legend-item b { color:#ffffff; font-weight:500; font-variant-numeric:tabular-nums; }
.kore-fs-swatch { flex:none; width:8px; height:8px; box-sizing:border-box; }
.kore-fs-swatch-ring, .kore-fs-swatch-self { border:1.5px solid; background:transparent; }
.kore-fs-swatch-self { border-radius:50%; }
.kore-fs-console { flex:1 1 auto; }
.kore-fs-quick { flex:0 1 auto; overflow:auto; }
.kore-fs-quick-group { display:grid; grid-template-columns:32px minmax(0,1fr); gap:0 8px; align-items:start; }
.kore-fs-quick-group + .kore-fs-quick-group { margin-top:12px; }
.kore-fs-quick-label { margin:0; color:#8a8c92; font:400 12px/28px Arial,'Microsoft YaHei','MiSans',sans-serif; }
.kore-fs-quick-actions { display:flex; flex-wrap:wrap; gap:8px 6px; }
.kore-fs-quick-btn { height:28px; padding:0 10px; border:1px solid #2a2a2e; border-radius:6px; background:transparent; color:#d6d6d9; font:13px/1 Arial,'Microsoft YaHei','MiSans',sans-serif; white-space:nowrap; transition:border-color 120ms ease-out,color 120ms ease-out; }
.kore-fs-quick-btn:hover { border-color:#6a6a70; color:#ffffff; }
.kore-fs-quick-btn:focus-visible { outline:1px solid #6fb3c9; outline-offset:2px; }
.kore-fs-quick-btn:disabled { border-color:#222224; color:#8a8c92; cursor:default !important; }
.kore-fs-log-body { flex:1 1 auto; min-height:0; display:flex; flex-direction:column; overflow:auto; font:13px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
.kore-fs-log-body > :first-child { margin-top:auto; }
.kore-fs-log-body .kore-console-line { flex:none; white-space:pre; }
.kore-fs-log-body .kore-console-time { color:#8a8c92; }
.kore-fs-command { flex:none; display:flex; align-items:center; gap:8px; margin-top:12px; padding-top:12px; border-top:1px solid #222224; }
.kore-fs-prompt { color:#6fb3c9; font:13px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
.kore-fs-input { flex:1 1 auto; min-width:0; height:32px; box-sizing:border-box; padding:0 10px; border:1px solid #2a2a2e; border-radius:6px; background:#0f0f11; color:#ffffff; font:13px/30px Arial,'Microsoft YaHei','MiSans',sans-serif; }
.kore-fs-input::placeholder { color:#8a8c92; }
.kore-fs-input:focus { outline:none; border-color:#6fb3c9; }
@media (max-width:1360px) { .kore-fs-grid { grid-template-columns:280px minmax(0,1fr) 340px; } }
@media (max-width:1100px) {
  .kore-fs-main { overflow:auto; }
  .kore-fs-grid { flex:none; grid-template-columns:minmax(0,1fr); }
  .kore-fs-col-map .kore-fs-map-stage { width:min(100%,420px); }
  .kore-fs-col-side .kore-fs-tabs { height:360px; flex:none; }
  .kore-fs-col-log .kore-fs-console { height:360px; flex:none; }
}
@media (max-width:700px) {
  .kore-fs-bar { padding:0 12px; }
  .kore-fs-main { padding:16px 12px 20px; }
  .kore-fs-head { flex-direction:column; gap:12px; }
  .kore-fs-hint { display:none; }
}
.kore-debug { position:fixed; top:0; right:0; bottom:0; width:min(460px,100vw); z-index:2147483100; display:flex; flex-direction:column; background:#171719; border-left:1px solid #222224; box-shadow:-16px 0 40px rgba(0,0,0,.45); }
.kore-debug[hidden] { display:none !important; }
.kore-debug-header { flex:0 0 40px; display:flex; align-items:center; justify-content:space-between; padding:0 16px; border-bottom:1px solid #222224; background:#131217; }
.kore-debug-title { color:#ffffff; font:600 13px/1 Arial,'Microsoft YaHei','MiSans',sans-serif; }
.kore-debug-close { height:26px; padding:0 12px; border:1px solid #3a3a3e; border-radius:999px; background:#212023; color:#ffffff; font:12px/24px Arial,'Microsoft YaHei','MiSans',sans-serif; cursor:pointer; }
.kore-debug-close:hover { border-color:#6fb3c9; }
.kore-debug-body { flex:1 1 auto; min-height:0; overflow:auto; padding:16px; }
.kore-debug-section { display:flex; flex-direction:column; gap:8px; padding-bottom:16px; }
.kore-debug-section + .kore-debug-section { border-top:1px solid #1b1a1f; padding-top:16px; }
.kore-debug-section-title { margin:0; color:#8a8c92; font:500 12px/1.2 Arial,'Microsoft YaHei','MiSans',sans-serif; }
.kore-debug-status { display:grid; grid-template-columns:max-content minmax(0,1fr); gap:3px 12px; align-items:baseline; }
.kore-debug-status-label { color:#8a8c92; }
.kore-debug-status-value { color:#ffffff; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-variant-numeric:tabular-nums; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.kore-debug-pre { margin:0; padding:10px; border:1px solid #222224; background:#131217; color:#ffffff; font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; white-space:pre-wrap; overflow:auto; }
.kore-debug-note { color:#d9a441; font-size:12px; }
.kore-debug-select, .kore-debug-editor { box-sizing:border-box; width:100%; border:1px solid #3a3a3e; border-radius:4px; background:#131217; color:#ffffff; font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; padding:6px 8px; }
.kore-debug-editor { min-height:220px; resize:vertical; }
.kore-debug-actions { display:flex; flex-wrap:wrap; gap:6px; }
.kore-debug-console { flex:none; height:240px; overflow:auto; border:1px solid #222224; border-radius:4px; padding:6px 8px; background:#131217; font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
.kore-debug-console .kore-console-line { white-space:pre; overflow:hidden; text-overflow:ellipsis; }
.kore-debug-console .kore-console-time { color:#8a8c92; }
.kore-debug .kore-button { height:26px; padding:0 12px; border:1px solid #3a3a3e; border-radius:999px; background:#212023; color:#ffffff; font:12px/24px Arial,'Microsoft YaHei','MiSans',sans-serif; cursor:pointer; }
.kore-debug .kore-button:hover { border-color:#6fb3c9; }
.kore-fullscreen, .kore-debug { cursor:default; }
.kore-fullscreen button, .kore-debug button, .kore-fullscreen select, .kore-debug select { cursor:pointer; }
.kore-fullscreen input, .kore-debug input, .kore-fullscreen textarea, .kore-debug textarea { cursor:text; }
.kore-fullscreen canvas { cursor:crosshair; }
/* The game hides the native cursor with .custom-cursor *; the overlay must
   opt back in or the fullscreen/debug pages have no visible pointer. */
body.custom-cursor .kore-fullscreen, body.custom-cursor .kore-fullscreen *,
body.custom-cursor .kore-debug, body.custom-cursor .kore-debug * { cursor:default !important; }
body.custom-cursor .kore-fullscreen button, body.custom-cursor .kore-debug button,
body.custom-cursor .kore-fullscreen select, body.custom-cursor .kore-debug select { cursor:pointer !important; }
body.custom-cursor .kore-fullscreen input, body.custom-cursor .kore-debug input,
body.custom-cursor .kore-fullscreen textarea, body.custom-cursor .kore-debug textarea { cursor:text !important; }
body.custom-cursor .kore-fullscreen canvas { cursor:crosshair !important; }
@media (prefers-reduced-motion: reduce) { .kore-fullscreen,.kore-fs-btn,.kore-fs-tab,.kore-fs-quick-btn,.kore-fs-gauge-fill { transition:none; } }
`;

export function ensureKorePanelStyle(page = globalThis) {
  const document = page?.document;
  if (!document?.head || document.getElementById?.(KORE_PANEL_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = KORE_PANEL_STYLE_ID;
  style.textContent = KORE_PANEL_CSS;
  document.head.append(style);
}
