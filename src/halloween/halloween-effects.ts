// A client-only 2026 Halloween skin. Dates are checked once on startup; no midnight scheduler.
export const HALLOWEEN_STORAGE_KEY = 'lastro-halloween-effects-disabled';
export const HALLOWEEN_PREVIEW_STORAGE_KEY = 'lastro-halloween-effects-preview-2026';
const HALLOWEEN_GHOST_IDS = [1179, 1120] as const;
const HALLOWEEN_WISP_ID = 1129;

export function isHalloweenDate(date: Date = new Date()): boolean {
  if (date.getFullYear() !== 2026) return false;
  const month = date.getMonth();
  const day = date.getDate();
  return (month === 9 && day >= 30) || (month === 10 && day === 1);
}

export interface HalloweenEffectsController {
  readonly seasonal: boolean;
  readonly disabled: boolean;
  readonly previewAvailable: boolean;
  readonly previewEnabled: boolean;
  setDisabled(value: boolean): boolean;
  setPreview(value: boolean): boolean;
  setMonsterPortraitLoader(loader: (id: number) => Promise<string>): boolean;
  setStatusIconLoader(loader: () => Promise<string>): boolean;
  destroy(): void;
}

declare global {
  var LastROHalloweenEffects: HalloweenEffectsController | undefined;
}

type RendererPage = Window & {
  __LastRORenderer?: { Renderer?: { canvas?: HTMLCanvasElement } };
};

export function installHalloweenEffects(page: Window = window): HalloweenEffectsController {
  const doc = page.document;
  const now = new Date();
  // URL preview is Vite-only; the persisted preview is controlled in graphics settings.
  const development = import.meta.env.DEV;
  const devPreview = development && new URL(page.location.href).searchParams.get('halloween-preview') === '1';
  const previewAvailable = now.getFullYear() === 2026;
  const dateSeasonal = isHalloweenDate(now);
  let previewEnabled = previewAvailable && development;
  let disabled = false;
  try {
    disabled = page.localStorage.getItem(HALLOWEEN_STORAGE_KEY) === '1';
    const savedPreview = page.localStorage.getItem(HALLOWEEN_PREVIEW_STORAGE_KEY);
    previewEnabled = previewAvailable && (savedPreview === '1' || (savedPreview === null && development));
  } catch { /* No storage: use default. */ }

  let layer: HTMLDivElement | null = null;
  let ghost: HTMLImageElement | null = null;
  let wisps: HTMLImageElement[] = [];
  let statusIcon: HTMLImageElement | null = null;
  let statusBadge: HTMLDivElement | null = null;
  let monsterPortraitLoader: ((id: number) => Promise<string>) | undefined;
  let statusIconLoader: (() => Promise<string>) | undefined;
  const ghostSources = new Map<number, string>();
  let wispSource: string | undefined;
  let canvas: HTMLCanvasElement | null = null;
  let canvasTimer: number | undefined;
  let ghostTimer: number | undefined;
  let ghostHideTimer: number | undefined;
  let destroyed = false;

  const seasonal = () => dateSeasonal || devPreview || previewEnabled;
  const active = () => seasonal() && !disabled && !destroyed;
  const loadSprites = () => {
    if (!active() || !monsterPortraitLoader) return;
    for (const id of HALLOWEEN_GHOST_IDS) {
      if (ghostSources.has(id)) continue;
      void monsterPortraitLoader(id).then(source => {
        ghostSources.set(id, source);
        if (active() && ghost && !ghost.hasAttribute('src')) {
          ghost.src = source;
          scheduleGhost(true);
        }
      }).catch(() => undefined);
    }
    if (!wispSource) {
      void monsterPortraitLoader(HALLOWEEN_WISP_ID).then(source => {
        wispSource = source;
        if (active()) for (const wisp of wisps) wisp.src = source;
      }).catch(() => undefined);
    }
  };
  const loadStatusIcon = () => {
    if (!active() || !statusIcon || !statusIconLoader) return;
    void statusIconLoader().then(source => {
      if (active() && statusIcon && statusBadge) {
        statusIcon.src = source;
        statusBadge.hidden = false;
      }
    }).catch(() => undefined);
  };
  const clearGhostTimers = () => {
    if (ghostTimer !== undefined) page.clearTimeout(ghostTimer);
    if (ghostHideTimer !== undefined) page.clearTimeout(ghostHideTimer);
    ghostTimer = ghostHideTimer = undefined;
  };
  const hideGhost = () => {
    if (!ghost) return;
    ghost.classList.remove('is-visible');
    ghost.hidden = true;
  };
  const scheduleGhost = (first = false) => {
    if (!active() || doc.hidden || ghostTimer !== undefined || ghostHideTimer !== undefined || !ghostSources.size) return;
    const delay = (first ? 350 : 12_000) + Math.floor(Math.random() * (first ? 300 : 12_000));
    ghostTimer = page.setTimeout(() => {
      ghostTimer = undefined;
      if (!active() || doc.hidden || !ghost || !layer?.isConnected) return;
      const sources = [...ghostSources.values()];
      const source = sources[Math.floor(Math.random() * sources.length)];
      if (!source) return;
      ghost.src = source;
      const fromRight = Math.random() > 0.5;
      ghost.hidden = false;
      ghost.style.top = (12 + Math.floor(Math.random() * 56)) + '%';
      ghost.classList.toggle('from-right', fromRight);
      // Restart the CSS keyframes after a previous appearance.
      ghost.classList.remove('is-visible');
      void ghost.offsetWidth;
      ghost.classList.add('is-visible');
      ghostHideTimer = page.setTimeout(() => {
        ghostHideTimer = undefined;
        hideGhost();
        scheduleGhost();
      }, 8_000);
    }, delay);
  };
  const randomizeWisp = (wisp: HTMLImageElement) => {
    const direction = Math.random() < 0.5 ? -1 : 1;
    wisp.style.setProperty('--wisp-drift-x', `${(Math.random() * 12 - 6).toFixed(1)}vw`);
    wisp.style.setProperty('--wisp-drift-y', `${Math.floor(Math.random() * 37) - 18}px`);
    wisp.style.setProperty('--wisp-exit-x', `${direction * (110 + Math.floor(Math.random() * 31))}vw`);
  };
  const ensureLayer = () => {
    if (layer?.isConnected) return;
    const container = doc.createElement('div');
    container.className = 'lastro-halloween-layer';
    container.setAttribute('aria-hidden', 'true');
    const vignette = doc.createElement('div');
    vignette.className = 'lastro-halloween-vignette';
    container.append(vignette);
    wisps = [];
    for (const [left, top, delay] of [['14%', '24%', '0s'], ['48%', '57%', '-2s'], ['82%', '38%', '-4s']] as const) {
      const wisp = doc.createElement('img');
      wisp.className = 'lastro-halloween-wisp';
      wisp.alt = '';
      wisp.draggable = false;
      wisp.style.left = left;
      wisp.style.top = top;
      wisp.style.animationDelay = delay;
      wisp.style.setProperty('--wisp-duration', `${22 + Math.floor(Math.random() * 19)}s`);
      randomizeWisp(wisp);
      wisp.addEventListener('animationiteration', () => randomizeWisp(wisp));
      wisps.push(wisp);
      container.append(wisp);
    }
    ghost = doc.createElement('img');
    ghost.className = 'lastro-halloween-ghost';
    ghost.alt = '';
    ghost.draggable = false;
    ghost.hidden = true;
    ghost.addEventListener('load', () => scheduleGhost(true));
    container.append(ghost);
    const curse = doc.createElement('div');
    curse.className = 'lastro-halloween-status';
    curse.hidden = true;
    curse.title = '本地万圣节效果：南瓜诅咒（仅画面显示）';
    curse.setAttribute('role', 'img');
    curse.setAttribute('aria-label', curse.title);
    statusBadge = curse;
    statusIcon = doc.createElement('img');
    statusIcon.className = 'lastro-halloween-status-icon';
    statusIcon.alt = '';
    curse.append(statusIcon);
    container.append(curse);
    doc.body.append(container);
    layer = container;
    if (wispSource) for (const wisp of wisps) wisp.src = wispSource;
    const firstGhost = ghostSources.values().next().value;
    if (firstGhost) ghost.src = firstGhost;
    loadSprites();
    loadStatusIcon();
  };
  const attachCanvas = () => {
    canvasTimer = undefined;
    if (!active()) return;
    const next = (page as RendererPage).__LastRORenderer?.Renderer?.canvas;
    if (next?.tagName === 'CANVAS') {
      if (canvas !== next) {
        canvas?.classList.remove('lastro-halloween-canvas');
        canvas = next;
      }
      canvas.classList.add('lastro-halloween-canvas');
      return;
    }
    // Renderer.init may happen long after login; this polls only until it is available.
    canvasTimer = page.setTimeout(attachCanvas, 1000);
  };
  const clearCanvas = () => {
    if (canvasTimer !== undefined) page.clearTimeout(canvasTimer);
    canvasTimer = undefined;
    canvas?.classList.remove('lastro-halloween-canvas');
    canvas = null;
  };
  const apply = () => {
    page.dispatchEvent(new Event('lastro-halloween-change'));
    doc.body.classList.toggle('lastro-halloween-active', active());
    if (!active()) {
      clearGhostTimers();
      hideGhost();
      layer?.remove();
      layer = null;
      ghost = null;
      wisps = [];
      statusIcon = null;
      statusBadge = null;
      clearCanvas();
      return;
    }
    ensureLayer();
    if (!canvas && canvasTimer === undefined) attachCanvas();
  };
  const onVisibility = () => {
    if (doc.hidden) {
      clearGhostTimers();
      hideGhost();
    } else if (active() && ghostSources.size) scheduleGhost(true);
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === HALLOWEEN_STORAGE_KEY) disabled = event.newValue === '1';
    else if (event.key === HALLOWEEN_PREVIEW_STORAGE_KEY)
      previewEnabled = previewAvailable && (event.newValue === '1' || (event.newValue === null && development));
    else return;
    apply();
  };

  doc.addEventListener('visibilitychange', onVisibility);
  page.addEventListener('storage', onStorage);
  apply();

  return {
    get seasonal() { return seasonal(); },
    get disabled() { return disabled; },
    get previewAvailable() { return previewAvailable; },
    get previewEnabled() { return previewEnabled; },
    setDisabled(value) {
      if (destroyed) return false;
      const next = value === true;
      try { page.localStorage.setItem(HALLOWEEN_STORAGE_KEY, next ? '1' : '0'); }
      catch { return false; }
      disabled = next;
      apply();
      return true;
    },
    setPreview(value) {
      if (destroyed || !previewAvailable) return false;
      const next = value === true;
      try { page.localStorage.setItem(HALLOWEEN_PREVIEW_STORAGE_KEY, next ? '1' : '0'); }
      catch { return false; }
      previewEnabled = next;
      apply();
      return true;
    },
    setMonsterPortraitLoader(loader) {
      if (destroyed) return false;
      monsterPortraitLoader = loader;
      loadSprites();
      return true;
    },
    setStatusIconLoader(loader) {
      if (destroyed) return false;
      statusIconLoader = loader;
      loadStatusIcon();
      return true;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      doc.removeEventListener('visibilitychange', onVisibility);
      page.removeEventListener('storage', onStorage);
      apply();
    },
  };
}
