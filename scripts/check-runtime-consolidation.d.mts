export type RuntimeConsolidationStage =
  | 'audio'
  | 'sync'
  | 'gameplay'
  | 'receive'
  | 'packet'
  | 'localization'
  | 'ui-layout'
  | 'ui-state'
  | 'worldmap'
  | 'final';

export interface RetiredRuntimeTransform {
  module: string;
  imported: string;
  local: string;
  callOwner: string;
}

export interface RelocatedRuntimeBinding {
  retiredModule: string;
  retiredExport: string;
  module: string;
  imported: string;
  local: string;
  callOwner?: string;
  patcherImport?: boolean;
}

export interface RuntimeCoordinatorBinding {
  module: string;
  imported: string;
  local: string;
  callOwner: string;
}

export interface CoreOwnershipInput {
  vendorSource: string;
  patcherSource: string;
  prepareSource: string;
  retiredTransforms: RetiredRuntimeTransform[];
  retiredHostExports: string[];
  relocatedBindings?: RelocatedRuntimeBinding[];
  coordinatorBindings?: RuntimeCoordinatorBinding[];
  forbiddenHostDefinitions?: string[];
  strictRelocationAudit?: boolean;
  patcherDeclarationsSource?: string;
  permanentModules?: PermanentRuntimeModule[];
  forbiddenHostTransforms?: string[];
  /** Enables the fixed31 owners, fixed40 retirements, fixed12 display mappings and retired host APIs. */
  strictCoreAudit?: boolean;
}

export interface PermanentRuntimeOwner {
  kind: 'function' | 'variable' | 'class' | 'method' | 'assignment' | 'call';
  name: string;
  region?: string;
  topLevel?: boolean;
  /** New permanent helpers/state cannot be host-defined; existing bundle owners remain editable. */
  protectHost?: boolean;
}

export interface PermanentRuntimeModule {
  module: string;
  owners: PermanentRuntimeOwner[];
}

export declare const permanentRuntimeModules: PermanentRuntimeModule[];

export interface RuntimeSourceDifference {
  owner: string;
  kind: string;
  detail: string;
}

export interface RuntimeSourceComparison {
  equal: boolean;
  differences: RuntimeSourceDifference[];
  relocatedOwners?: string[];
  structuralDeltas?: string[];
}

export declare function auditCoreOwnership(input: CoreOwnershipInput): string[];

export declare function compareRuntimeSources(
  before: string,
  after: string,
  options: { stage: RuntimeConsolidationStage },
): RuntimeSourceComparison;
