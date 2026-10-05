import type { LastroServerWalkAltitude } from './lastro-server-walk.mjs';
import type { LastroPositionWalkHint } from './lastro-position-reconciliation.mjs';

export function selectLastroMovementTarget(options?: {
  position: ArrayLike<number>;
  walk?: LastroPositionWalkHint;
  target: { x: number; y: number };
  range?: number;
  altitude: LastroServerWalkAltitude;
  occupied?: (x: number, y: number) => boolean;
  findPath: (x0: number, y0: number, x1: number, y1: number, out: Int16Array, altitude: LastroServerWalkAltitude) => number;
}): { x: number; y: number } | null;
