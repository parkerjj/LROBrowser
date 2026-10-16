export interface KoreConfigIdentity {
  profile: string;
  aid: number;
  cid: number;
}
export interface KoreConfigDocument extends KoreConfigIdentity {
  fileName: string;
  rawText: string;
  revision: number;
}
export interface KoreConfigDocumentInput extends KoreConfigIdentity {
  fileName: string;
  rawText: string;
}
export interface KoreConfigStore {
  ensureDefaults(identity: KoreConfigIdentity, defaults: Record<string, string>): Promise<void>;
  saveDocument(document: KoreConfigDocumentInput): Promise<KoreConfigDocument>;
  getDocument(identity: KoreConfigIdentity & { fileName: string }): Promise<KoreConfigDocument | null>;
  listDocuments(identity: KoreConfigIdentity): Promise<KoreConfigDocument[]>;
  getReloadDocuments(identity: KoreConfigIdentity): Promise<KoreConfigDocument[]>;
  close(): Promise<void>;
}
export function createKoreConfigStore(options?: {
  page?: unknown;
  indexedDBFactory?: IDBFactory;
  databaseName?: string;
}): KoreConfigStore;
