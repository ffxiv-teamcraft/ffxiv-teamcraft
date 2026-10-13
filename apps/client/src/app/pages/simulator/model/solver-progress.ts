/**
 * Progress snapshot emitted by the solver while it searches, intended for UI progress
 * indicators (e.g. a progress bar showing current best quality found so far)
 */
export interface SolverProgress {
  /** Current search depth (i.e. number of steps considered so far) */
  depth: number;
  /** Highest quality value found among completed (progress = 100%) rotations so far */
  bestQuality: number;
  /** Wheter any completed (Progress = 100%) rotation has been found yet */
  bestSuccess: boolean;
  /** Wheter the best rotation found so far also reaches 100% quality */
  qualityComplete: boolean;
  /** Total number of simulation evaluations performed so far (for diagnostics) */
  nodesEvaluated: number;
}