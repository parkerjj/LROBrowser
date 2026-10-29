// A client-only 2026 Halloween skin. Dates are checked once on startup; no midnight scheduler.
export const HALLOWEEN_STORAGE_KEY = 'lastro-halloween-effects-disabled';

export function isHalloweenDate(date: Date = new Date()): boolean {
  if (date.getFullYear() !== 2026) return false;
  const month = date.getMonth();
  const day = date.getDate();
  return (month === 9 && day >= 30) || (month === 10 && day === 1);
}

export interface HalloweenEffectsController {
  readonly seasonal: boolean;
  readonly disabled: boolean;
  setDisabled(value: boolean): boolean;
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
  const seasonal = isHalloweenDate(new Date());
  let disabled = false;
  try { disabled = page.localStorage.getItem(HALLOWEEN_STORAGE_KEY) === '1'; } catch { /* No storage: use default. */ }

  let layer: HTMLDivElement | null = null;
  let ghost: HTMLImageElement | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let canvasTimer: number | undefined;
  let ghostTimer: number | undefined;
  let ghostHideTimer: number | undefined;
  let destroyed = false;

  const active = () => seasonal && !disabled && !destroyed;
  const reducedMotion = () => page.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
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
    if (!active() || doc.hidden || reducedMotion() || ghostTimer !== undefined) return;
    const delay = (first ? 20_000 : 90_000) + Math.floor(Math.random() * (first ? 25_000 : 90_000));
    ghostTimer = page.setTimeout(() => {
      ghostTimer = undefined;
      if (!active() || doc.hidden || !ghost || !layer?.isConnected) return;
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
      }, 5500);
    }, delay);
  };
  const ensureLayer = () => {
    if (layer?.isConnected) return;
    const container = doc.createElement('div');
    container.className = 'lastro-halloween-layer';
    container.setAttribute('aria-hidden', 'true');
    const vignette = doc.createElement('div');
    vignette.className = 'lastro-halloween-vignette';
    container.append(vignette);
    for (const [x, y, delay] of [['13%', '22%', '0s'], ['86%', '31%', '-4s'], ['8%', '68%', '-9s']] as const) {
      const flame = doc.createElement('span');
      flame.className = 'lastro-halloween-flame';
      flame.style.left = x;
      flame.style.top = y;
      flame.style.animationDelay = delay;
      container.append(flame);
    }
    const pumpkin = doc.createElement('img');
    pumpkin.className = 'lastro-halloween-pumpkin';
    pumpkin.src = '/halloween/pumpkin.svg';
    pumpkin.alt = '';
    pumpkin.draggable = false;
    container.append(pumpkin);
    ghost = doc.createElement('img');
    ghost.className = 'lastro-halloween-ghost';
    ghost.src = '/halloween/ghost.svg';
    ghost.alt = '';
    ghost.draggable = false;
    ghost.hidden = true;
    container.append(ghost);
    doc.body.append(container);
    layer = container;
    scheduleGhost(true);
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
    doc.body.classList.toggle('lastro-halloween-active', active());
    if (!active()) {
      clearGhostTimers();
      hideGhost();
      layer?.remove();
      layer = null;
      ghost = null;
      clearCanvas();
      return;
    }
    ensureLayer();
    if (!canvas && canvasTimer === undefined) attachCanvas();
    if (ghostTimer === undefined && ghostHideTimer === undefined) scheduleGhost(true);
  };
  const onVisibility = () => {
    if (doc.hidden) {
      clearGhostTimers();
      hideGhost();
    } else if (active()) scheduleGhost(true);
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== HALLOWEEN_STORAGE_KEY) return;
    disabled = event.newValue === '1';
    apply();
  };

  doc.addEventListener('visibilitychange', onVisibility);
  page.addEventListener('storage', onStorage);
  apply();

  return {
    get seasonal() { return seasonal; },
    get disabled() { return disabled; },
    setDisabled(value) {
      if (destroyed) return false;
      const next = value === true;
      try { page.localStorage.setItem(HALLOWEEN_STORAGE_KEY, next ? '1' : '0'); }
      catch { return false; }
      disabled = next;
      apply();
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
