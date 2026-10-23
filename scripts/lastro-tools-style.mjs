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
`;

// M7 shell styles are injected by installKoreShellPanels for both the native
// shortcut entry and the classic LastRO panel, so the Switch survives the
// shortcut-entry mode wrapper.
export const KORE_SHELL_CSS = `
:host { width:520px; max-width:calc(100vw - 16px); box-sizing:border-box; }
/* Palette per context: the classic panel is light, the native LastRO panel is
   dark navy with an amber accent, the KE page is neutral dark with a cyan hue. */
.lastro-tools { position:relative; --sw-ink:#111827; --sw-muted:#5b6472; --sw-rule:#e3e7ee; --sw-track:#e8ebf1; --sw-border:#cfd5df; --sw-thumb:#ffffff; --sw-thumb-border:#cfd5df; --ke:#0e7490; --ke-ink:#ffffff; --ke-text:#0e7490; }
.lastro-tools.kore-shell-native { --sw-ink:#e6ecf4; --sw-muted:#9db0c5; --sw-rule:rgba(148,168,196,.14); --sw-track:#121821; --sw-border:rgba(148,168,196,.24); --sw-thumb:#2c3a4e; --sw-thumb-border:rgba(148,168,196,.3); --ke:#6fb3c9; --ke-ink:#06141a; --ke-text:#8fd0e6; }
.lastro-tools[data-mode="kore"] { --sw-ink:#ffffff; --sw-muted:#8a8c92; --sw-rule:#222224; --sw-track:#0f0f11; --sw-border:#2a2a2e; --ke:#6fb3c9; --ke-ink:#06141a; --ke-text:#8fd0e6; }
.lastro-ro-titlebar { position:relative; display:flex; align-items:center; justify-content:flex-end; height:44px; flex:0 0 44px; box-sizing:border-box; padding:0 8px 0 12px; background:transparent; color:var(--sw-ink); border-bottom:1px solid var(--sw-rule); cursor:move; }
.lastro-title-left,.lastro-title-right { display:none; }
/* 原生面板的开关行：四个开关卡片 + 末尾一个与卡片同高的方形设置按钮，保持一行。 */
.lastro-main-view .lastro-quick-toggles { grid-template-columns:repeat(4,minmax(0,1fr)) 32px; }
.lastro-main-view .lastro-quick-toggles label { box-sizing:border-box; height:32px; }
.lastro-quick-toggles .lastro-toggles-settings { box-sizing:border-box; width:32px; height:32px; padding:0; display:flex; align-items:center; justify-content:center; border:1px solid rgba(148,168,196,.12); border-radius:6px; background:#18202c; color:#9db0c5; font:14px/1 Arial,'Microsoft YaHei','MiSans',sans-serif; cursor:pointer; }
.lastro-quick-toggles .lastro-toggles-settings:hover { color:#e6ecf4; border-color:rgba(232,184,75,.5); background:#26313f; }
@media(max-width:480px) { .lastro-main-view .lastro-quick-toggles { grid-template-columns:repeat(2,minmax(0,1fr)); } .lastro-quick-toggles .lastro-toggles-settings { grid-column:2; justify-self:end; } }
.lastro-window-minimize,.lastro-window-close { position:static; transform:none; flex:none; width:28px; height:28px; margin-left:2px; padding:0; border:0; border-radius:4px; background:transparent; color:color-mix(in srgb,var(--sw-ink) 62%,transparent); font:300 18px/28px Arial,sans-serif; cursor:pointer; transition:background-color 120ms ease-out,color 120ms ease-out; }
.lastro-window-minimize:hover,.lastro-window-close:hover { background:color-mix(in srgb,var(--sw-ink) 12%,transparent); color:var(--sw-ink); }
.lastro-tools[data-mode="kore"] > :not(.lastro-ro-titlebar):not(.kore-shell-host):not(.lastro-panel-footer):not(.lastro-compact-status):not(.kore-boot):not(style) { display:none !important; }
.lastro-tools.kore-shell-native[data-mode="lastro"] > .lastro-ro-titlebar { margin:-11px -11px 8px; }
/* The switch sits dead centre. The thumb marks the selected side; while the
   LastRO side is selected, the KE side keeps its hue, a twinkling spark and a
   slow ring so it reads as the place to go. */
.lastro-mode-switch { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); display:grid; grid-template-columns:1fr 1fr; width:252px; height:34px; box-sizing:border-box; padding:3px; border:1px solid var(--sw-border); border-radius:9px; background:var(--sw-track); }
.lastro-mode-thumb { position:absolute; top:3px; bottom:3px; left:3px; width:calc(50% - 3px); box-sizing:border-box; border:1px solid var(--sw-thumb-border); border-radius:6px; background:var(--sw-thumb); pointer-events:none; transition:transform 340ms cubic-bezier(.3,.9,.3,1),background-color 260ms ease-out,border-color 260ms ease-out; }
.lastro-tools[data-mode="kore"] .lastro-mode-thumb { transform:translateX(100%); background:var(--ke); border-color:var(--ke); }
.lastro-mode-option { position:relative; z-index:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:0; border:0; border-radius:6px; background:transparent; color:var(--sw-muted); font:600 13px/1 Arial,'Microsoft YaHei','MiSans',sans-serif; cursor:pointer; white-space:nowrap; transition:color 200ms ease-out,background-color 160ms ease-out; }
.lastro-mode-option.is-active { color:var(--sw-ink); }
.lastro-mode-option[data-shell-mode="lastro"]:not(.is-active):hover { color:var(--sw-ink); }
.lastro-mode-option[data-shell-mode="kore"] { color:var(--ke-text); }
.lastro-mode-option[data-shell-mode="kore"]:not(.is-active) { background:color-mix(in srgb,var(--ke) 14%,transparent); }
.lastro-mode-option[data-shell-mode="kore"]:not(.is-active):hover { background:color-mix(in srgb,var(--ke) 26%,transparent); }
.lastro-mode-option[data-shell-mode="kore"].is-active { color:var(--ke-ink); }
.lastro-mode-option[data-shell-mode="kore"]::before { content:''; flex:none; width:10px; height:10px; background:currentColor; clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%); }
.lastro-mode-option[data-shell-mode="kore"]:not(.is-active)::before { animation:ke-twinkle 3.2s ease-in-out infinite; }
.lastro-mode-option[data-shell-mode="kore"]:not(.is-active)::after { content:''; position:absolute; inset:0; box-sizing:border-box; border:1.5px solid var(--ke); border-radius:6px; pointer-events:none; animation:ke-beacon 3.2s ease-out infinite; }
.lastro-mode-option:focus-visible { outline:2px solid var(--ke); outline-offset:2px; }
@keyframes ke-twinkle { 0%,55%,100% { transform:scale(.85); opacity:.7; } 70% { transform:scale(1.2); opacity:1; } }
@keyframes ke-beacon { 0%,40% { transform:scale(1); opacity:0; } 48% { opacity:.85; } 100% { transform:scale(1.14,1.4); opacity:0; } }
.lastro-tools[data-mode="kore"] { padding:0; border-color:#26272b; background:#171719; box-shadow:none; color:#ffffff; }
.lastro-tools[data-mode="kore"] .lastro-panel-footer { background-image:none !important; background:#131217; }
/* LastRO -> KE ignition: a glow at the KE tab, an iridescent ring running the
   panel edge for three laps while its arc swells and shrinks, a diagonal sheen,
   then the content rising in. Removed after 2.8s. */
.kore-boot { position:absolute; inset:0; z-index:5; overflow:hidden; border-radius:inherit; pointer-events:none; }
.kore-boot-pulse { position:absolute; left:147px; top:18px; width:40px; height:40px; margin:-20px 0 0 -20px; border-radius:50%; background:radial-gradient(circle,rgba(159,227,255,.6),rgba(111,179,201,.25) 40%,transparent 70%); animation:kore-pulse 800ms cubic-bezier(.2,.7,.2,1) both; } /* taste-skill-ignore: requested one-off transition, absent at rest */
.kore-boot-ring { position:absolute; inset:0; padding:1.5px; box-sizing:border-box; overflow:hidden; border-radius:inherit; -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0); mask-composite:exclude; animation:kore-fade 2600ms ease-out both; } /* taste-skill-ignore: solid mask that hollows the ring, not a visible gradient */
.kore-boot-ring::before { content:''; position:absolute; left:50%; top:50%; width:900px; height:900px; margin:-450px 0 0 -450px; background:conic-gradient(from 0deg,transparent 0 calc(360deg - var(--kore-arc,120deg)),#6fb3c9 calc(360deg - var(--kore-arc,120deg) * .67),#5fc39c calc(360deg - var(--kore-arc,120deg) * .42),#8b7cf6 calc(360deg - var(--kore-arc,120deg) * .19),#ffffff calc(360deg - var(--kore-arc,120deg) * .04),transparent 360deg); animation:kore-spin 2600ms cubic-bezier(.35,.1,.3,1) both,kore-arc 2600ms ease-in-out both; } /* taste-skill-ignore: requested one-off transition, absent at rest */
.kore-boot-sheen { position:absolute; top:-20%; bottom:-20%; left:-40%; width:24%; background:linear-gradient(90deg,transparent,rgba(111,179,201,.14) 35%,rgba(255,255,255,.24) 50%,rgba(139,124,246,.16) 65%,transparent); mix-blend-mode:screen; animation:kore-sheen 1000ms 120ms cubic-bezier(.4,.1,.2,1) both; } /* taste-skill-ignore: requested one-off transition, absent at rest */
.lastro-tools.is-igniting .kore-window > * { animation:kore-rise 460ms cubic-bezier(.2,.8,.2,1) both; }
.lastro-tools.is-igniting .kore-window > :nth-child(1) { animation-delay:120ms; }
.lastro-tools.is-igniting .kore-window > :nth-child(2) { animation-delay:180ms; }
.lastro-tools.is-igniting .kore-window > :nth-child(3) { animation-delay:240ms; }
.lastro-tools.is-igniting .kore-window > :nth-child(4) { animation-delay:300ms; }
@keyframes kore-pulse { from { transform:scale(.2); opacity:1; } to { transform:scale(26); opacity:0; } }
@keyframes kore-fade { 0% { opacity:0; } 15% { opacity:1; } 75% { opacity:1; } 100% { opacity:0; } }
@property --kore-arc { syntax:'<angle>'; inherits:false; initial-value:120deg; }
@keyframes kore-spin { from { transform:rotate(-120deg); } to { transform:rotate(960deg); } }
@keyframes kore-arc { 0%,100% { --kore-arc:36deg; } 50% { --kore-arc:300deg; } }
@keyframes kore-sheen { from { transform:skewX(-18deg) translateX(0); } to { transform:skewX(-18deg) translateX(620%); } }
@keyframes kore-rise { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
@media (prefers-reduced-motion: reduce) { .lastro-mode-option,.lastro-mode-thumb,.lastro-window-minimize,.lastro-window-close { transition:none; } .lastro-mode-option::before,.lastro-mode-option::after { animation:none !important; } .kore-boot { display:none; } .lastro-tools.is-igniting .kore-window > * { animation:none; } }
.kore-shell-host { flex:1 1 auto; height:320px; min-height:0; overflow:hidden; box-sizing:border-box; }
.kore-window { display:flex; flex-direction:column; height:320px; min-height:0; box-sizing:border-box; padding:10px 12px; background:#171719; color:#ffffff; font:12px/1.5 Arial,'Microsoft YaHei','MiSans',system-ui,sans-serif; }
.kore-window, .kore-window * { cursor:default !important; }
.kore-window button, .kore-window select { cursor:pointer !important; }
.kore-window input { cursor:text !important; }
.kore-window [hidden] { display:none !important; }
.kore-onboarding { display:flex; flex:1 1 auto; min-height:0; flex-direction:column; gap:9px; overflow:auto; }
.kore-onboarding-title { margin:0; color:#ffffff; font:600 18px/1.2 Arial,'Microsoft YaHei','MiSans',sans-serif; }
.kore-onboarding-lead { margin:0; color:#b4b4b4; font-size:12px; overflow-wrap:anywhere; }
.kore-onboarding-steps { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin:2px 0 0; padding:8px 0 0; border-top:1px solid #29292d; list-style:none; }
.kore-onboarding-step { min-width:0; color:#8a8c92; font-size:11px; line-height:1.3; overflow-wrap:anywhere; }
.kore-onboarding-step::before { content:attr(data-step); display:block; width:18px; height:18px; margin-bottom:4px; color:#8a8c92; font:500 11px/18px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
.kore-onboarding-step[data-state="current"] { color:#ffffff; }
.kore-onboarding-step[data-state="current"]::before { color:#6fb3c9; border-bottom:1px solid #6fb3c9; }
.kore-onboarding-step[data-state="complete"] { color:#b4b4b4; }
/* 内容按自然高度排布，由 .kore-onboarding 滚动；允许内容被压缩会让文字盖到下面的按钮上。 */
.kore-onboarding-content { display:flex; flex:0 0 auto; flex-direction:column; gap:6px; }
.kore-onboarding-status, .kore-onboarding-error { margin:0; color:#b4b4b4; font-size:12px; line-height:1.4; overflow-wrap:anywhere; }
.kore-onboarding-error { color:#e58686; }
.kore-error-card { display:flex; flex-direction:column; gap:6px; padding:9px 10px; border:1px solid #4a2a2e; border-radius:4px; background:#1c1517; }
.kore-error-title { margin:0; color:#ffffff; font-size:13px; line-height:1.3; font-weight:600; }
.kore-error-steps { margin:0; padding-left:18px; color:#d8d8da; font-size:12px; line-height:1.5; overflow-wrap:anywhere; }
.kore-error-code { align-self:flex-start; max-width:100%; padding:2px 6px; border-radius:3px; background:#2a2224; color:#f0b4b4; font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; overflow-wrap:anywhere; user-select:all; }
.kore-device-code { align-self:flex-start; color:#ffffff; font:500 24px/1.25 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-variant-numeric:tabular-nums; user-select:all; }
.kore-onboarding-actions { display:flex; flex:none; flex-wrap:wrap; align-items:center; gap:6px; padding-top:4px; }
.kore-auth-primary, .kore-auth-secondary { min-height:32px; max-width:100%; padding:5px 11px; border:1px solid #ffffff; border-radius:4px; background:#ffffff; color:#111111; font:500 12px/1.25 Arial,'Microsoft YaHei','MiSans',sans-serif; overflow-wrap:anywhere; }
.kore-auth-primary:hover { background:#e6e6ea; }
.kore-auth-secondary { border-color:#3a3a3e; background:transparent; color:#ffffff; }
.kore-auth-secondary:hover { border-color:#6a6a70; }
.kore-auth-link { min-height:28px; padding:4px 7px; border:0; border-radius:3px; background:transparent; color:#b4b4b4; font:12px/1.2 Arial,'Microsoft YaHei','MiSans',sans-serif; }
.kore-auth-link:hover { color:#ffffff; background:#212023; }
.kore-auth-primary:focus-visible, .kore-auth-secondary:focus-visible, .kore-auth-link:focus-visible { outline:1px solid #6fb3c9; outline-offset:2px; }
.kore-auth-primary:disabled, .kore-auth-secondary:disabled { border-color:#333337; background:#222224; color:#8a8c92; }
.kore-runtime-view { display:flex; flex:1 1 auto; min-height:0; flex-direction:column; }
.kore-config-notice { display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin:0 0 8px; flex:none; }
.kore-config-source { flex:1 1 120px; min-width:0; color:#8a8c92; font-size:12px; line-height:1.4; overflow-wrap:anywhere; }
.kore-config-source[data-cached="true"] { color:#e5a93b; }
.kore-config-edit, .kore-config-retry { flex:none; }
.kore-button:disabled { border-color:#333337; background:#222224; color:#8a8c92; }
.kore-button:focus-visible { outline:1px solid #6fb3c9; outline-offset:2px; }
.kore-device-expiry { color:#b4b4b4; font-size:11px; font-variant-numeric:tabular-nums; }
.kore-quota-list { display:flex; flex-direction:column; gap:4px; min-height:0; max-height:120px; overflow:auto; border-top:1px solid #29292d; border-bottom:1px solid #29292d; }
.kore-quota-instance { display:flex; align-items:center; gap:8px; min-height:32px; padding:3px 0; color:#ffffff; font-size:12px; cursor:pointer !important; }
/* 站点全局样式给 input 设了 width:100%，不覆盖的话单选框撑满整行，实例名被挤成 0 宽。 */
.kore-quota-instance input { flex:none; width:14px; height:14px; min-width:0; min-height:0; margin:0; padding:0; accent-color:#6fb3c9; }
.kore-quota-instance-details { display:flex; flex:1 1 auto; justify-content:space-between; gap:8px; min-width:0; }
.kore-quota-instance-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.kore-quota-instance-map { color:#b4b4b4; white-space:nowrap; }
.kore-summary { display:flex; flex-direction:column; gap:6px; flex:none; }
.kore-identity-row { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.kore-identity { display:flex; align-items:baseline; gap:8px; min-width:0; }
.kore-name { font:600 14px/1.2 Arial,'Microsoft YaHei','MiSans',sans-serif; color:#ffffff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.kore-job { color:#8a8c92; font-size:12px; white-space:nowrap; }
.kore-header-actions { display:flex; gap:6px; flex:none; }
.kore-link-button { display:inline-flex; align-items:center; border:0; border-radius:4px; background:none; color:#8a8c92; font:12px/1 Arial,'Microsoft YaHei','MiSans',sans-serif; padding:4px 6px; cursor:pointer; }
.kore-link-button:hover { color:#ffffff; background:#212023; }
.kore-bars { display:grid; grid-template-columns:1fr 1fr; gap:6px 14px; }
.kore-bar { display:grid; grid-template-columns:24px minmax(0,1fr) 92px; align-items:center; gap:8px; font-size:12px; }
.kore-bar-label { color:#8a8c92; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
.kore-bar-track { height:6px; background:#212023; border:1px solid #222224; border-radius:999px; overflow:hidden; }
.kore-bar-fill { display:block; height:100%; width:0; background:#6fb3c9; transition:width 160ms ease-out; }
.kore-bar-hp .kore-bar-fill { background:#44a282; }
.kore-bar-fill[data-level="warn"] { background:#d9a441; }
.kore-bar-fill[data-level="crit"] { background:#e5566f; }
.kore-bar-value { text-align:right; color:#8a8c92; font:11px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-variant-numeric:tabular-nums; white-space:nowrap; }
.kore-meta { display:flex; flex-wrap:wrap; gap:4px 14px; color:#8a8c92; font-size:12px; }
.kore-mode[data-mode="AUTO"] { color:#5fc39c; }
.kore-mode[data-mode="MANUAL"] { color:#6fb3c9; }
.kore-mode[data-mode="OFF"] { color:#8a8c92; }
.kore-wait { color:#d9a441; font-size:12px; }
.kore-actions { display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin:8px 0; flex:none; }
.kore-button { height:24px; padding:0 10px; border:1px solid #3a3a3e; border-radius:999px; background:#212023; color:#ffffff; font:12px/22px Arial,'Microsoft YaHei','MiSans',sans-serif; cursor:pointer; white-space:nowrap; transition:border-color 120ms ease-out,color 120ms ease-out; }
.kore-button:hover { border-color:#6fb3c9; color:#ffffff; }
.kore-mode-switch { display:flex; gap:6px; margin:8px 0 0; flex:none; }
.kore-mode-button { flex:1 1 0; min-width:0; padding:0 6px; overflow:hidden; text-overflow:ellipsis; }
.kore-mode-button[data-active="true"] { border-color:#ffffff; background:#ffffff; color:#111111; }
.kore-render-toggle { display:flex; align-items:center; gap:4px; color:#8a8c92; font-size:12px; margin-left:auto; cursor:pointer; }
.kore-console { flex:none; height:calc(6 * 1.5em); overflow:hidden; border:1px solid #222224; border-radius:4px; padding:4px 6px; font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; background:#131217; }
.kore-console-line { white-space:pre; overflow:hidden; text-overflow:ellipsis; }
.kore-console-time { color:#8a8c92; }
.kore-command { display:flex; align-items:center; gap:6px; padding-top:8px; flex:none; }
.kore-prompt { color:#6fb3c9; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
.kore-command-input { flex:1; min-width:0; height:26px; border:1px solid #3a3a3e; border-radius:4px; background:#131217; color:#ffffff; font:12px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; padding:0 8px; }
.kore-command-input:focus { outline:none; border-color:#6fb3c9; }
.kore-send { height:26px; padding:0 12px; border:1px solid #3a3a3e; border-radius:4px; background:#212023; color:#ffffff; font:12px/24px Arial,'Microsoft YaHei','MiSans',sans-serif; cursor:pointer; }
.kore-send:hover { border-color:#6fb3c9; }
@media (max-width:360px) { .kore-window { padding:8px 9px; } .kore-onboarding { gap:7px; } .kore-onboarding-steps { gap:4px; } .kore-auth-primary, .kore-auth-secondary { flex:1 1 auto; } }
@media (prefers-reduced-motion: reduce) { .kore-bar-fill { transition:none; } .kore-button { transition:none; } }
`;
