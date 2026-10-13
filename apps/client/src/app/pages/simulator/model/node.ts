import { CraftingAction } from "@ffxiv-teamcraft/simulator";

/**
 * A single node in the search tree: on candidate partial (or complete) rotation,
 * together with its simulated outcome and a heuristic score used to rank it against
 * sibling nodes for beam-search pruning
 */
export interface Node {
  /** The sequence of actions that produced  this node's simulated state */
  actions: CraftingAction[];
  /** The 'SimulationResult' produced by running 'actions' through the simulator */
  result: any;
  /** Heuristic score used to rank/prune nodes. Higher is better. See {@link buildNode} */
  score: number;
  /** Wheter this node's quality has reached (or exceeded, capped) the recipe's target quality */
  qualityComplete: boolean;
  /** Wheter this node represents a fully completed craft (progress = 100%) */
  progressComplete: boolean;
  /**
   * Optimistic estimate of the maximum progress obtainable in a single further step
   * from this node's state, used for branch-and-bound pruning
   */
  maxRemainingProgress: number;
}