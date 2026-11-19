export interface NativeReleaseResult {
  version: string;
  files: number;
  feeds: string[];
}

export function publishNativeRelease(input: {
  client: unknown;
  bucket: string;
  directory: string;
  version: string;
  commit: string;
  publishedAt: string;
  notes?: string;
  publicKey: string;
  verifyArtifact?: (artifact: { url: string; size: number }) => Promise<void> | void;
}): Promise<NativeReleaseResult>;
