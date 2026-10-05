export interface LastroCardArtDependencies {
  DB: {
    INTERFACE_PATH: string;
    getItemInfo(id: number): { illustResourcesName?: string } | null | undefined;
  };
  Client: {
    loadFile(path: string, success: (url: unknown) => void, failure: () => void): unknown;
  };
  UIManager?: { components?: Record<string, object> };
  getItemInfo?(): object | null | undefined;
  document?: Document;
}
export function installLastroCardArt(component: object | null | undefined, deps: LastroCardArtDependencies): boolean;
