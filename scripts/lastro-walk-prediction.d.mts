import type { LastroServerWalkAltitude } from './lastro-server-walk.mjs';

export interface LastroWalkPredictionSegment {
  x0: number; y0: number; x1: number; y1: number; start: number; end: number;
}
export interface LastroWalkPrediction {
  segments: LastroWalkPredictionSegment[];
  startTick: number; endTick: number; startX: number; startY: number;
  endX: number; endY: number; totalDistance: number;
}
export interface LastroWalkPredictionSample {
  x: number; y: number; finished: boolean; distance: number; dx: number; dy: number;
}
export interface LastroWalkPredictionInput {
  position: ArrayLike<number>;
  walk?: {
    speed: number; path?: ArrayLike<number>; total?: number; index?: number;
    pos?: ArrayLike<number>; tick?: number; prevTick?: number;
    _lastroJoinIndex?: number; _lastroJoinEndTick?: number; _lastroJoinSpeed?: number;
    _lastroServerStepIndex?: number; _lastroServerStepSpeed?: number; _lastroNormalSpeed?: number;
  } | null;
  dest: ArrayLike<number> | { x: number; y: number };
  now: number;
  altitude: LastroServerWalkAltitude;
  findPath?: typeof findLastroPredictedServerPath;
}
/** Returns an origin-inclusive path of at most 32 steps; unsafe map indices or exhausted search return 0. */
export function findLastroPredictedServerPath(
  x0: number, y0: number, x1: number, y1: number, out: Int16Array, altitude: LastroServerWalkAltitude,
): number;
export function lastroWalkStepDuration(dx: number, dy: number, speed: number): number;
export function createLastroWalkPrediction(input: LastroWalkPredictionInput): LastroWalkPrediction | null;
export function sampleLastroWalkPrediction(prediction: LastroWalkPrediction | null | undefined, now: number): LastroWalkPredictionSample | null;
