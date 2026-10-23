export interface KoreConfigIdentity {
  profile: string;
  aid: number;
  cid: number;
  nid: number;
}
export interface KoreConfigDocument extends KoreConfigIdentity {
  fileName: string;
  rawText: string;
  revision: number;
  savedAt: number | null;
}
export interface KoreConfigDocumentInput extends KoreConfigIdentity {
  fileName: string;
  rawText: string;
}
export interface KoreConfigStore {
  replaceProfile(identity: KoreConfigIdentity, files: Record<string, string | undefined>): Promise<KoreConfigDocument[]>;
  getProfile(identity: KoreConfigIdentity): Promise<KoreConfigDocument[] | null>;
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
