export type KeQueueMode = 'auto' | 'shared' | 'plain';
export const KE_QUEUE_MODE_STORAGE_KEY: 'lro.keQueueMode';
export function keBuildTarget(page: { LastRONativeBuild?: boolean; LastROWebBuild?: boolean } | null | undefined): 'iwa' | 'web' | 'native';
export function resolveKeQueueMode(options?: { buildTarget?: string; storage?: { getItem(key: string): string | null } | null }): KeQueueMode;
