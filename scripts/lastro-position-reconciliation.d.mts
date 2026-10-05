import type { LastroServerWalkAltitude } from './lastro-server-walk.mjs';

export interface LastroPositionAltitude extends LastroServerWalkAltitude {
  getCellHeight(x: number, y: number): number | undefined;
}
export interface LastroPositionReconciler {
  /** Display position; authoritative coordinates must remain separate. */
  readonly position: Float32Array;
  /** Tangent of the displayed approved tile segment, or zero outside correction. */
  readonly direction: Float32Array;
  /** A skill-specific same-cell render hold; never changes authoritative state. */
  readonly holdingStop: boolean;
  /** A caller-approved ordinary STOP/arrival tolerance of at most one eighth cell. */
  readonly holdingMicroStop: boolean;
  /** Passive correction reason, including settled/follow transitions. */
  readonly lastHardSetReason: string;
  /** An acknowledged forward corridor or its finite recovery tail is still active. */
  readonly continuingApprovedMove: boolean;
  /** Opt in only after an unambiguous initial MOVE ACK matches the prediction's entire short native path. */
  continueApprovedMove(target: ArrayLike<number>, now: number, speed: number, walk: LastroPositionWalkHint,
    proof: LastroPositionWalkHint): boolean;
  /** Revoke new forward permissions while retaining only already proved, non-growing recovery debt. */
  cancelApprovedMove(): boolean;
  /** reason is a fixed technical tag of lowercase letters/hyphens, never a user identifier. */
  reset(target: ArrayLike<number>, now: number, reason?: string): Float32Array;
  /** Hold a verified small ahead offset on the last approved corridor for a skill STOP. */
  holdAtStop(target: ArrayLike<number>, now: number, speed: number, walk: LastroPositionWalkHint): boolean;
  /** Hold a stable same-cell residual after an ordinary STOP/arrival; callers must exclude hit/control/relocation. */
  holdSmallStop(target: ArrayLike<number>, now: number, speed: number, walk: LastroPositionWalkHint): boolean;
  /** Read-only GAT/height/approved-visit check for inheriting a skill hold or stable micro residual. maxOffset is capped at one eighth cell. */
  canContinueFromSameCell(target: ArrayLike<number>, walk: LastroPositionWalkHint, maxOffset?: number): boolean;
  /** Resume ordinary smooth correction from the held display without moving it immediately. */
  releaseStopHold(now: number): boolean;
  /** speed is the native time in milliseconds for one orthogonal cell. Repeated targets retain correction timing. */
  correct(target: ArrayLike<number>, now: number, speed: number, walk?: LastroPositionWalkHint): Float32Array;
  update(target: ArrayLike<number>, now: number, speed: number, walk?: LastroPositionWalkHint): Float32Array;
}
/** Approved native tile route; offsets refer to flat (x,y) pairs, including repeated visits to one tile. */
export interface LastroPositionWalkHint {
  path: ArrayLike<number>;
  /** Destination node of the current segment; index === total denotes the final endpoint. */
  index: number;
  /** total === 0 preserves the approved corridor/cursors; a delayed STOP can backtrack up to eight walked cells. */
  total: number;
}
export function createLastroPositionReconciler(options: {
  altitude: LastroPositionAltitude;
  findPath: (x0: number, y0: number, x1: number, y1: number, out: Int16Array, altitude: LastroServerWalkAltitude) => number;
}): LastroPositionReconciler;
