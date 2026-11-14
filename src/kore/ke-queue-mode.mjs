// KE 队列模式开关 keQueueMode：auto（有 SharedArrayBuffer 用共享队列，没有就用普通队列）、
// shared（强制共享队列）、plain（强制普通队列）。默认值：原生版 plain，IWA / web 为 auto（与以前行为一致）。
const MODES = ['auto', 'shared', 'plain'];
export const KE_QUEUE_MODE_STORAGE_KEY = 'lro.keQueueMode';

export function keBuildTarget(page) {
  if (page?.LastRONativeBuild === true) return 'native';
  if (page?.LastROWebBuild === true) return 'web';
  return 'iwa';
}

export function resolveKeQueueMode({ buildTarget, storage } = {}) {
  try {
    const stored = storage?.getItem?.(KE_QUEUE_MODE_STORAGE_KEY);
    if (MODES.includes(stored)) return stored;
  } catch { /* 无痕窗口或站点数据被禁用时访问存储会抛异常，按默认值处理 */ }
  return buildTarget === 'native' ? 'plain' : 'auto';
}
