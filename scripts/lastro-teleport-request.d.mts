export interface VerifiedTeleportRequestOptions {
  preflight: { check(route: unknown): Promise<{ approved: boolean }>; cancel(): void };
  navigation: { request(route: unknown): string; cancel(): void };
  getMap(): string;
  getProfile(): unknown;
  clearNavigation?(): void;
  sendTeleport?(point: readonly unknown[]): void;
}
export interface TeleportRequestOptions {
  skipPreflight?: boolean;
}
export function createLastroVerifiedTeleportRequest(options: VerifiedTeleportRequestOptions): {
  request(route: unknown, requestOptions?: TeleportRequestOptions): Promise<string | null>;
  cancelPending(): void;
  cancel(): void;
};
