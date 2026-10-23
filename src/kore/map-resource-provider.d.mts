export const FIELD_PACK_VERSION: '2.0.5';

export interface FieldMapResourceRequest {
  requestId: number;
  resourceType: 'fieldMap';
  mapName: string;
  baseName: string;
  serverFieldsFolder: string;
  fieldpackVersion: string;
  attempt: number;
  cacheMode: 'prefer' | 'network';
  includeAuxiliary?: boolean;
}

export interface FieldMapResourceFile {
  role: 'field' | 'weight' | 'dist';
  relativePath: string;
  sha256: string;
  encoding: 'identity' | 'gzip';
  bytes: ArrayBuffer;
}

export type FieldMapResourceResult =
  | { kind: 'fieldMap'; files: FieldMapResourceFile[] }
  | { kind: 'error'; code: string; message: string };

export interface MapResourceValidationMessage {
  requestId: number;
  sourceRequestId: number;
  fieldRelativePath?: string;
  acceptedFiles: string[];
  rejectedFiles: Array<{ relativePath: string; reason: string }>;
}

export interface MapResourceProvider {
  configure?(options?: { aliases?: Record<string, string>; expectedSha256?: Record<string, string> | ((relativePath: string) => string | undefined) }): void;
  handleResourceRequest(message: FieldMapResourceRequest): Promise<{ requestId: number; result: FieldMapResourceResult }>;
  handleResourceValidation(message: MapResourceValidationMessage): Promise<{
    requestId: number;
    sourceRequestId: number;
    committedFiles: string[];
    deletedFiles: string[];
  }>;
  close(): Promise<void>;
}

export function createMapResourceProvider(options?: Record<string, unknown>): MapResourceProvider;
export function candidatePaths(request: FieldMapResourceRequest, aliases?: Record<string, string>): Array<{
  relativePath: string;
  encoding: 'identity' | 'gzip';
}>;
