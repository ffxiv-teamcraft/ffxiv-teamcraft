import { Craft, CrafterStats } from "@ffxiv-teamcraft/simulator";

/** All parameters required to run the crafting rotation solver*/
export interface SolverInput {
  /** The 'simulation' class from the active `@ffxiv-teamcraft/simulator` package */
  Simulation: any;
  /** The 'CraftingActionsRegistry' static object from the active simulator bundle */
  registry: any;
  /** The 'ActionType' enum from the active simulator bundle */
  ActionType: any;
  /** The 'Buff' enum from the active simulator bundle */
  Buff: any;
  /** The recipe/craft being solved for */
  recipe: Craft;
  /** The crafter's stats (craftsmanship, control, CP, level, specialist flag, etc) */
  stats: CrafterStats;
  /** Optional starting HQ ingredient quality contributions */
  hqIngredients?: { id: number; amount: number }[];
  /** Maximum number of candidate branches kept alive per search depth (beam width) */
  beamWidth: number;
  /** Hard cap on the number of steps a generated rotation may contain */
  maxSteps: number;
  /** Wall-clock time budget for the search in milliseconds */
  maxComputeMs: number;
  /**
   * Whether Cosmic Exploration-only actions (e.g. Stellar Steady Hand, Material Miracle)
   * may be used by the solver. Defaults to false. These actions are not available for most
   * recipes and should not be suggested unless the caller explicitly opts in
   */
  shouldUseCosmicExploration?: boolean;
  /**
   * Whether Specialist-only actions (e.g. Heart and Soul) may be used by the solver. This
   * flag alone is not sufficient - the crafter's stats must also have the 'specialist: true'
   * for this actions to be considered. Defaults to false
   */
  shouldUseSpecialistCommands?: boolean;
}