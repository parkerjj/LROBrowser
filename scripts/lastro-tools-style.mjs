// Classic RO window chrome uses the packaged native titlebar and close artwork.
export const LASTRO_TOOLS_CSS = `
:host { width:520px; max-width:calc(100vw - 16px); box-sizing:border-box; color:#202536; font:400 14px/1.5 Arial,'Microsoft YaHei','MiSans','LastRO Glyph Fallback',sans-serif; }
.ui-component-root { height:100%; max-height:var(--lastro-panel-max-height,none); min-width:0; min-height:0; }
[hidden] { display:none !important; }
.lastro-tools { display:flex; flex-direction:column; width:100%; height:100%; max-height:var(--lastro-panel-max-height,none); min-width:0; min-height:0; overflow:hidden; box-sizing:border-box; border:1px solid #8b99b1; border-radius:4px; background:#f8f9fc; box-shadow:inset 0 0 0 1px #fff,1px 2px 4px #0004; padding:0; }
.lastro-ro-titlebar { position:relative; height:20px; flex:0 0 20px; box-sizing:border-box; background-repeat:repeat-x; background-size:auto 20px; color:#202536; border-bottom:1px solid #a0acc3; border-radius:3px 3px 0 0; cursor:move; }
.lastro-ro-titlebar strong { position:absolute; top:0; left:15px; font-size:13px; line-height:20px; font-weight:500; }
.lastro-title-left,.lastro-title-right { position:absolute; top:0; width:12px; height:20px; background-size:100% 100%; pointer-events:none; }
.lastro-title-left { left:0; }.lastro-title-right { right:0; }
.lastro-window-close { position:absolute; right:5px; top:4px; width:11px; height:11px; padding:0; border:0; background-color:transparent; background-repeat:no-repeat; cursor:pointer; }
.lastro-window-minimize { position:absolute; right:20px; top:4px; width:11px; height:11px; padding:0; border:0; background-color:transparent; background-repeat:no-repeat; cursor:pointer; }
.lastro-panel-footer { position:relative; height:16px; flex:0 0 16px; background-repeat:repeat-x; }
.lastro-window-resize { position:absolute; right:1px; bottom:1px; width:13px; height:13px; margin:0; padding:0; border:0; background-color:transparent; background-repeat:no-repeat; cursor:se-resize; touch-action:none; }
:host(.lastro-is-resizing) { user-select:none; }
.lastro-settings-view,.lastro-teleport-body { display:flex; flex-direction:column; flex:1 1 auto; min-width:0; min-height:0; overflow:hidden; box-sizing:border-box; container:lastro-panel / inline-size; padding:7.5px 9px 6px; font-size:10.5px; }
.lastro-tabs { display:flex; flex-wrap:wrap; flex:none; gap:2.25px; padding:0 0 5.25px; margin:0 0 6px; border:0; border-bottom:1px solid #ced4e1; background:none; }
.lastro-tab { flex:1; min-width:31.5px; padding:3.75px 2.25px; border:1px solid transparent; border-radius:3px; background:none; color:#202536; font:inherit; font-size:10.5px; line-height:15.75px; cursor:pointer; white-space:nowrap; }
.lastro-tab.is-active { border-color:#698ac5; background:#527bc2; color:white; box-shadow:inset 0 1px 0 #8cace0; }
.lastro-tab:hover:not(.is-active) { background:#e7edf7; border-color:#ccd7eb; }
.lastro-button { min-height:20.25px; padding:2.25px 9px; border:1px solid #a9b2c2; border-radius:3px; background:linear-gradient(#fff,#e9edf4); box-shadow:inset 0 0 0 1px #fff; color:#263854; font:inherit; font-size:9.75px; cursor:pointer; white-space:nowrap; }
.lastro-button:hover { border-color:#7796c5; background:linear-gradient(#fff,#dce7f7); }
.lastro-button:disabled { cursor:default; color:#9299a7; background:#eef0f5; border-color:#cdd1db; box-shadow:none; }
button:focus-visible,input:focus-visible,select:focus-visible { outline:2px solid #7396d0; outline-offset:1px; }
.lastro-settings-body { display:block; flex:1 1 325px; height:325px; min-height:0; overflow-y:auto; overflow-x:hidden; padding-right:16px; position:relative; }
.lastro-group { padding:3.75px 0 6px; border:0; border-bottom:1px solid #e0e4ed; border-radius:0; background:none; }
.lastro-group-title { margin:3px 0 3.75px; color:#4a6291; font-size:9px; font-weight:500; }
.lastro-line { display:flex; align-items:center; flex-wrap:wrap; gap:6px; min-height:23.25px; color:inherit; margin:2.25px 0; }
.lastro-line > span:first-child { min-width:56.25px; }
.lastro-line .lt-controls { display:flex; align-items:center; flex-wrap:wrap; gap:4.5px; flex:1; min-width:0; }
.lastro-line select { flex:1 1 75px; min-width:0; }.lastro-line input[type=number] { width:45px; }
.lastro-line .lt-small { width:36px; }.lastro-line .lt-unit,.lastro-help { color:#7c879c; font-size:9px; }
.lastro-tools input:not([type=checkbox]),.lastro-tools select { box-sizing:border-box; max-width:100%; height:18px; border:1px solid #b1b8c4; border-radius:2px; background:white; color:#202536; padding:.75px 3.75px; font:inherit; font-size:9.75px; }
.lastro-tools input[type=checkbox] { width:11.25px; height:11.25px; margin:0; accent-color:#527bc2; appearance:auto; flex:none; }
.lastro-help { margin:1.5px 0 4.5px; }.lastro-slot-grid { display:grid; grid-template-columns:1fr 1fr; gap:2.25px 7.5px; }
.only-targets [data-targets] { display:flex; flex-wrap:wrap; gap:4.5px 9px; padding:5.25px; margin:3.75px 0; border:1px solid #b9c1ce; background:white; max-height:97.5px; overflow-y:auto; }
.only-targets [data-targets] label { display:flex; align-items:center; gap:3px; font-size:9.75px; }
.lastro-assist-list { display:flex; flex-wrap:wrap; gap:3px; }.lastro-assist-chip { border:1px solid #b7c6df; padding:.75px 3.75px; background:#e8eef8; color:#4a6291; font-size:9px; }
.lastro-status { flex:none; min-height:13.5px; font-size:9px; color:#607392; margin-top:3.75px; overflow-wrap:anywhere; }
.lastro-compact-status { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:5px 10px; }.lastro-tools.is-collapsed > *:not(.lastro-compact-status) { display:none !important; }
.lastro-route-tabs { gap:.75px; padding:0 0 5.25px; margin:0 0 6px; }.lastro-route-tabs .lastro-tab { min-width:31.5px; font-size:9.75px; line-height:15.75px; padding:3.75px 1.5px; }
.lastro-route-footer { display:flex; justify-content:flex-end; padding:6px 3px 0; }
.lastro-route-scroll { position:relative; flex:1 1 280px; height:280px; min-height:0; overflow-y:auto; overflow-x:hidden; padding-right:16px; }
.lastro-route-list { list-style:none; margin:0; padding:4px 3px; }.lastro-route-row { position:relative; display:flex; align-items:center; gap:6px; min-height:54.75px; box-sizing:border-box; padding:6.75px 3px; border-bottom:1px solid #e0e4ec; background:#f8f9fc; transform-origin:center; transition:transform 140ms ease-out,box-shadow 140ms ease-out,background-color 140ms ease-out; }
.lastro-route-row.is-dragging { z-index:3; background:#edf3ff; outline:1px solid #94add5; border-radius:3px; box-shadow:0 7px 14px #26385435,0 2px 4px #26385424; transform:translateY(var(--lastro-sort-offset,-3px)) scale(1.01); opacity:.96; }
.lastro-route-row.is-drag-moving { transition:box-shadow 140ms ease-out,background-color 140ms ease-out; }
.lastro-sort-handle { flex:0 0 11.25px; width:11.25px; padding:6px 0; border:0; background:none; color:#9ca9bf; cursor:grab; font-size:12.75px; line-height:1; touch-action:none; user-select:none; }
.lastro-sort-handle:active { cursor:grabbing; }.lastro-route-copy { min-width:0; flex:1; }.lastro-route-name { display:block; font-weight:400; font-size:11.25px; overflow-wrap:anywhere; }
.lastro-sort-handle:disabled { cursor:default; opacity:.4; }
.lastro-route-desc { display:block; color:#909bb0; font-size:9px; margin-top:2.25px; overflow-wrap:anywhere; }.lastro-route-go { min-width:39px; }.lastro-route-empty { padding:18px 7.5px; color:#7d8ba4; text-align:center; }
.lastro-route-location { display:block; color:#607392; font-size:8.25px; margin-top:2.25px; overflow-wrap:anywhere; }.lastro-route-actions { flex:none; display:flex; flex-wrap:wrap; justify-content:flex-end; gap:3px; max-width:112.5px; }.lastro-route-manage { padding-inline:5.25px; font-size:9px; }
.lastro-custom-toolbar { display:flex; flex:none; align-items:center; justify-content:space-between; gap:4.5px; padding-bottom:6px; }.lastro-custom-toolbar .lastro-help{margin:0}
.lastro-search-toolbar { display:flex; flex:none; flex-wrap:wrap; align-items:center; gap:4.5px; padding-bottom:6px; }.lastro-route-search { display:flex; align-items:center; gap:4.5px; flex:1; min-width:120px; }.lastro-route-search input { flex:1; min-width:0; width:100%; }.lastro-search-results { flex-basis:100%; margin:0; }
.lastro-custom-group-tabs .lastro-tab { flex:1 0 auto; min-width:max-content; padding-inline:3.75px; }.lastro-custom-source-tabs { margin-bottom:3.75px; }
[data-custom-form] { box-sizing:border-box; padding:9px 3px 6px; margin-bottom:6px; border-bottom:1px solid #ced4e1; }[data-custom-form] .lastro-line { display:grid; grid-template-columns:minmax(0,52.5px) minmax(0,1fr); margin:5.25px 0; }[data-custom-form] input { width:100% !important; }.lastro-custom-coordinates { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }.lastro-custom-buttons { display:flex; flex-wrap:wrap; gap:4.5px; margin-top:7.5px; }
.lastro-custom-map-row { display:flex; flex-wrap:wrap; align-items:center; gap:4.5px; }.lastro-custom-map-row .lastro-line { flex:1; min-width:120px; }.lastro-custom-map-row .lastro-button { flex:none; }
@media(max-width:480px) { :host{font-size:13px}.lastro-settings-view,.lastro-teleport-body{padding:6px;font-size:9.75px}.lastro-slot-grid{grid-template-columns:1fr}.lastro-tab{font-size:9px;line-height:14.625px}.lastro-route-tabs .lastro-tab{font-size:8.25px;line-height:14.625px}.lastro-route-row{gap:3.75px}.lastro-route-name{font-size:10.5px} }
@container lastro-panel (max-width:450px) { .lastro-slot-grid{grid-template-columns:1fr}.lastro-route-actions{max-width:82.5px}.lastro-custom-coordinates{gap:6px}.lastro-custom-coordinates .lastro-line{grid-template-columns:minmax(0,33.75px) minmax(0,1fr)} }
.lastro-mode-switch { position:absolute; left:50%; top:2px; transform:translateX(-50%); display:flex; gap:1px; padding:1px; border:1px solid #8b99b1; border-radius:9px; background:#e9edf4; box-shadow:inset 0 0 0 1px #fff; z-index:1; }
.lastro-mode-option { height:14px; padding:0 8px; border:0; border-radius:7px; background:transparent; color:#5a6a85; font:500 9.5px/14px Arial,'Microsoft YaHei','MiSans',sans-serif; cursor:pointer; white-space:nowrap; }
.lastro-mode-option.is-active { background:#527bc2; color:#fff; box-shadow:inset 0 1px 0 #8cace0; }
.lastro-mode-option:focus-visible { outline:1px solid #7396d0; outline-offset:1px; }
.lastro-tools { position:relative; }
.lastro-tools[data-mode="kore"] { border-color:#2a333c; background:#0a0b0d; box-shadow:inset 0 0 0 1px #11161b,1px 2px 8px #0008; color:#d6dbe1; }
.lastro-tools[data-mode="kore"] .lastro-ro-titlebar { background-image:none; background:#0c1014; border-bottom-color:#232a31; }
.lastro-tools[data-mode="kore"] .lastro-title-left,.lastro-tools[data-mode="kore"] .lastro-title-right { background-image:none !important; }
.lastro-tools[data-mode="kore"] .lastro-mode-switch { background:#07090b; border-color:#2a333c; box-shadow:none; }
.lastro-tools[data-mode="kore"] .lastro-mode-option { color:#7f8a96; }
.lastro-tools[data-mode="kore"] .lastro-mode-option.is-active { background:#6fb3c9; color:#061014; box-shadow:none; }
.lastro-tools[data-mode="kore"] .lastro-panel-footer { background-image:none !important; background:#0c1014; }
.lastro-tools.is-switching::after { content:""; position:absolute; inset:0; pointer-events:none; z-index:4; background:linear-gradient(180deg,transparent 0%,rgba(111,179,201,.22) 50%,transparent 100%); animation:kore-scan 400ms ease-out; }
.lastro-tools.is-switching .lastro-mode-switch { animation:kore-switch-pulse 400ms ease-out; }
@keyframes kore-scan { from{transform:translateY(-100%)} to{transform:translateY(100%)} }
@keyframes kore-switch-pulse { 0%{box-shadow:0 0 0 0 rgba(232,184,75,.55)} 55%{box-shadow:0 0 0 3px rgba(111,179,201,.3)} 100%{box-shadow:none} }
.kore-shell-host { flex:1 1 auto; height:320px; min-height:0; overflow:hidden; box-sizing:border-box; }
.kore-window { display:flex; flex-direction:column; height:320px; min-height:0; box-sizing:border-box; padding:8px 10px; background:#0a0b0d; color:#d6dbe1; font:11px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
.kore-summary { display:flex; flex-direction:column; gap:5px; flex:none; }
.kore-identity-row { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.kore-identity { display:flex; align-items:baseline; gap:8px; min-width:0; }
.kore-name { font:600 13px/1.2 Arial,'Microsoft YaHei','MiSans',sans-serif; color:#e8edf2; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.kore-job { color:#7f8a96; font-size:10.5px; white-space:nowrap; }
.kore-header-actions { display:flex; gap:4px; flex:none; }
.kore-link-button { border:1px solid #2a333c; border-radius:3px; background:#11161b; color:#7f8a96; font:10px/1 monospace; padding:3px 6px; cursor:pointer; }
.kore-link-button:hover { color:#6fb3c9; border-color:#3d4a55; }
.kore-bars { display:grid; grid-template-columns:1fr 1fr; gap:4px 12px; }
.kore-bar { display:grid; grid-template-columns:22px minmax(0,1fr) 86px; align-items:center; gap:6px; font-size:10px; }
.kore-bar-label { color:#7f8a96; }
.kore-bar-track { height:6px; background:#151a1f; border:1px solid #232a31; border-radius:2px; overflow:hidden; }
.kore-bar-fill { display:block; height:100%; width:0; background:#6fb3c9; transition:width 200ms ease-out; }
.kore-bar-hp .kore-bar-fill { background:#63a86f; }
.kore-bar-value { text-align:right; color:#9aa6b2; font-size:9.5px; white-space:nowrap; }
.kore-meta { display:flex; flex-wrap:wrap; gap:4px 12px; color:#9aa6b2; font-size:10px; }
.kore-mode[data-mode="AUTO"] { color:#63d68e; }
.kore-mode[data-mode="OFF"] { color:#7f8a96; }
.kore-wait { color:#d8b84a; font-size:10px; }
.kore-actions { display:flex; flex-wrap:wrap; align-items:center; gap:4px; margin:6px 0; flex:none; }
.kore-button { border:1px solid #2a333c; border-radius:3px; background:#11161b; color:#c5ced6; font:10px/1 monospace; padding:4px 7px; cursor:pointer; }
.kore-button:hover { border-color:#6fb3c9; color:#e8edf2; }
.kore-render-toggle { display:flex; align-items:center; gap:3px; color:#9aa6b2; font-size:10px; margin-left:auto; cursor:pointer; }
.kore-console { flex:none; height:calc(6 * 1.45em); overflow:hidden; border-top:1px solid #232a31; border-bottom:1px solid #232a31; padding:4px 0; font-size:10px; line-height:1.45em; background:#07090b; }
.kore-console-line { white-space:pre; overflow:hidden; text-overflow:ellipsis; }
.kore-console-time { color:#5c6670; }
.kore-command { display:flex; align-items:center; gap:6px; padding-top:6px; flex:none; }
.kore-prompt { color:#6fb3c9; }
.kore-command-input { flex:1; min-width:0; height:22px; border:1px solid #232a31; border-radius:3px; background:#0d1115; color:#d6dbe1; font:10px monospace; padding:0 6px; }
.kore-command-input:focus { outline:none; border-color:#6fb3c9; }
.kore-send { border:1px solid #2a333c; border-radius:3px; background:#11161b; color:#9aa6b2; font:10px monospace; padding:3px 7px; cursor:pointer; }
@media (prefers-reduced-motion: reduce) { .lastro-tools.is-switching::after { display:none; } .lastro-tools.is-switching .lastro-mode-switch { animation:none; } .kore-bar-fill { transition:none; } }
`;
