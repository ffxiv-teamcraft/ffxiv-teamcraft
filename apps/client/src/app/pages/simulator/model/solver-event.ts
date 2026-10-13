import { CraftingAction, SimulationReliabilityReport } from "@ffxiv-teamcraft/simulator";

/**
 * A single event emitted by {@link SolverService.solve}. Exactly one of 'progress' or
 * 'result' (with 'reliability') will be set per emission. 'progress' events precede the
 * final 'result' event, which also completed the observable
 */
export interface SolverEvent {
  /** Live progress snapshot while the solver is still searching */
  progress?: { depth: number; bestQuality: number; bestSuccess: boolean; qualityComplete: boolean };
  /** The final, best rotation found once the search has finished */
  result?: CraftingAction[];
  /** Reliablity analysis of the final rotation, for display alongside the result */
  reliablity?: SimulationReliabilityReport
}