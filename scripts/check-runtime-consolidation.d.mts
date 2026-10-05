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

export interface CoreOwnershipInput {
  vendorSource: string;
  patcherSource: string;
  prepareSource: string;
  retiredTransforms: RetiredRuntimeTransform[];
  retiredHostExports: string[];
}

export interface RuntimeSourceDifference {
  owner: string;
  kind: string;
  detail: string;
}

export interface RuntimeSourceComparison {
  equal: boolean;
  differences: RuntimeSourceDifference[];
  relocatedOwners?: string[];
}

export declare function auditCoreOwnership(input: CoreOwnershipInput): string[];

export declare function compareRuntimeSources(
  before: string,
  after: string,
  options: { stage: RuntimeConsolidationStage },
): RuntimeSourceComparison;
