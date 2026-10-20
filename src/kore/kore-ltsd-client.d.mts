export interface KoreLtsdApiError {
  code?: string;
  action?: string;
  [key: string]: unknown;
}
export interface KoreLtsdApiBody extends Record<string, unknown> {
  error?: KoreLtsdApiError;
}
export interface KoreLtsdResponse {
  status: number;
  ok: boolean;
  body: KoreLtsdApiBody | null;
  bodyText: string;
}
export interface KoreDeviceAuthorization {
  userCode: string;
  verificationUriComplete: string;
  expiresAt: number;
  interval: number;
}
export interface KoreLtsdClient {
  request(method: string, endpoint: string, options?: { body?: unknown; authenticated?: boolean }): Promise<KoreLtsdResponse>;
  beginDeviceAuthorization(options?: { label?: string }): Promise<KoreDeviceAuthorization>;
  pollDeviceAuthorization(): Promise<{ status: 'pending' | 'slow-down'; interval: number } | { status: 'approved' | 'denied' | 'expired' }>;
  getPendingDeviceAuthorization(): KoreDeviceAuthorization | null;
  cancelDeviceAuthorization(): void;
  getMe(): Promise<KoreLtsdResponse & { user?: { id: string; displayName: string } }>;
  revokeToken(): Promise<KoreLtsdResponse>;
  clearToken(): void;
  hasToken(): boolean;
}
export const LTSD_TOKEN_STORAGE_KEY: 'kore-ltsd-token';
export function createKoreLtsdClient(options?: {
  page?: { localStorage?: Storage; fetch?: typeof fetch };
  fetchImpl?: typeof fetch;
  storage?: Storage;
  now?: () => number;
}): KoreLtsdClient;
