import { Craft, CraftingAction, CrafterStats } from '@ffxiv-teamcraft/simulator';
import { SolverInput } from './solver-input';
import { SolverProgress } from './solver-progress';
import { Node } from './node';

/**
 * Class names (as reported by `action.constructor.name`) of actions, that are only available
 * through the Cosmic Exploration content and only applies to specific recipes there. These must never be part
 * of a generated rotation unless the caller explicitly opts in via {@link SolverInput["shouldUseCosmicExploration"]}.
 */
const COSMIC_EXPLORATION_ACTION_NAMES = new Set<string>([
  'MaterialMiracle2',
  'StellarSteadyHand2'
]);

/**
 * Class names of Specialist-only actions. These require both the crafter's "Specialist"
 * flag to be active (see {@link CrafterStats.specialist}) AND the caller opting in
 * via {@link SolverInput["shouldUseSpecialistCommands"]}. Without both conditions, these
 * actions are excluded from the candidate action pool entirely.
 */
const SPECIALIST_ACTION_NAMES = new Set<string>([
  'CarefulObservation2',
  'HeartAndSoul2',
  'QuickInnovation2'
]);

/**
 * Maps a crafting-action class name to the {@link Buff} enum key it activates, so the
 * solver can detet when re-activating a buff would be redundant (i.e. the buff is 
 * already active and not close to expiring).)
 */
const BUFF_ACTION_TO_BUFF_KEY: Record<string, string> = {
  Veneration2: 'VENERATION',
  Innovation2: 'INNOVATION',
  GreatStrides2: 'GREAT_STRIDES',
  Manipulation2: 'MANIPULATION',
  WasteNot2: 'WASTE_NOT',
  WasteNotII2: 'WASTE_NOT_II'
};

/**
 * How much larger a branch's worst-case remaining progress estimate must be treated
 * (as a safety margin) to avoid pruning away branches, that would still succeed once
 * buffs like Veneration are factored in. This in intentionally generous/optimistic
 */
const PRUNE_SAFETY_MULTIPLIER = 3;

/**
 * Minimum search depth before branch-and-boun pruning kicks in. Early steps are often
 * spent on buff setup (Muscle Memory, Veneration, etc.) which temporarily produces low/no
 * progress. Pruning too early would incorrectly discard these necessary setup branches.
 */
const MIN_DEPTH_BEFORE_PRUNING = 4;

/**
 * Searches for a high-quality, guaranteed-successful crafting rotation using a
 * beam-search with branch-and-bound pruning.
 * 
 * Priorities, in strict order (a rotation from a higher priority always outranks any
 * rotation only satisfying lower priorities, regardless of the lower priorities' values)
 * 1. The craft must reach 100% progress (a "complete" rotation). Rotations that never
 *    complete are never returned by the primary search (see {@link greedyFinish} for
 *    the fallback safety net)
 * 2. Among completed rotations, the one with the highest quality wins
 * 3. Among ties, fewer remaining/wasted resources and steps are preferred
 * 
 * All actions considered by the solver are restricted to those with a 100% success
 * rate for the current simulated state ("safe mode"), so the returned rotaions should
 * never fail due to a random condition roll.
 * 
 * @param input Search parameters, see {@link SolverInput}
 * @param onProgress Optional callback invoked after each completed search depth with
 *      {@link SolverProgress} snapshot, useful for live UI progress reporting
 * @returns The best rotation found, as an ordered list of {@link CraftingAction}s. A
 *      craft is guaranteed to complete (progress = 100%) on the rotaions's final action -
 *      no action is ever appended after the craft is already complete
 */
export function runSolver(input: SolverInput, onProgress?: (p: SolverProgress) => void): CraftingAction[] {
  const { Simulation, registry, ActionType, Buff, recipe, stats, hqIngredients,
    beamWidth, maxSteps, maxComputeMs,
    shouldUseCosmicExploration = false,
    shouldUseSpecialistCommands = false } = input;
  const startTime = performance.now();

  /**
   * Determines whether a given action is allowed to be used by the solver, based on
   * the Cosmic Exploration / Specialist opt-in flagss and the crafter's specialist status
   * @param action The Action to check
   * @returns Returns if the action is allowed or not
   */
  const isActionAllowed = (action: CraftingAction): boolean => {
    const name = (action as any).constructor?.name;
    if (COSMIC_EXPLORATION_ACTION_NAMES.has(name))
      return shouldUseCosmicExploration;
    if (SPECIALIST_ACTION_NAMES.has(name))
      return shouldUseSpecialistCommands && !!stats.specialist;
    return true;
  }

  const candidateActions: CraftingAction[] = [
    ...registry.getActionsByType(ActionType.PROGRESSION),
    ...registry.getActionsByType(ActionType.QUALITY),
    ...registry.getActionsByType(ActionType.BUFF),
    ...registry.getActionsByType(ActionType.REPAIR),
    ...registry.getActionsByType(ActionType.OTHER),
    ...registry.getActionsByType(ActionType.CP_RECOVERY)
  ].filter(isActionAllowed);

  const progressionActions = registry.getActionsByType(ActionType.PROGRESSION).filter(isActionAllowed);

  /**
   * Runs a full simulation of the given action sequence in safe mode (no random
   * condition rolls) and returns the resulting 'SimulationResult'
   * @param actions The action Sequence to simulate
   * @returns The result of the simulation
   */
  const evaluate = (actions: CraftingAction[]) => {
    const sim = new Simulation(recipe, actions, stats, hqIngredients || []);
    return sim.run(true, Infinity, true);
  };

  /**
   * Optimistic best-case progress gain achievable via a single safe, affordable
   * progression action from the given simulation state. Used only for pruning
   * @param simulation The simulation state to evaluate
   * @returns The maximum progress gain achievable in a single step from the given state
   */
  const estimateMaxProgressPerStep = (simulation: any): number => {
    let max = 0;
    for (const action of progressionActions) {
      if (!action.canBeUsed(simulation, true)) continue;
      if (action.getSuccessRate(simulation) < 100) continue;
      const value = action.getBaseProgression(simulation);
      if (value > max) max = value;
    }
    return max;
  };

  /**
   * Returns the active Buff entry matching the given 'Buff' enum key name, or
   * 'undefined' if that buff is not currently active on the simulation
   * @param simulation The simulation state to check for active buffs
   * @param buffKeyName The 'Buff' enum key name to look for (e.g. "VENERATION", "INNOVATION", etc.)
   * @returns The active Buff entry or 'undefined' if not found
   */
  const findActiveBuff = (simulation: any, buffKeyName: string): any => {
    return simulation.buffs.find((b: any) => Buff[b.buff] === buffKeyName);
  };

  /**
   * Prevents re-activating a buff that is already active an not about to expire
   * which would otherwise waste CP/durability without any additional effect
   * @param action The Action to check for redundant buff activation
   * @param simulation The simulation state to check for active buffs
   * @returns Returns true if the action would redundantly re-activate an already active buff, false otherwise
   */
  const isRedundantBuffActivation = (action: CraftingAction, simulation: any): boolean => {
    const buffKey = BUFF_ACTION_TO_BUFF_KEY[action.constructor?.name];
    if (!buffKey) return false;
    const active = findActiveBuff(simulation, buffKey);
    if (!active) return false;
    return (active.duration ?? 0) > 1;
  };

  let nodesEvaluated = 0;

  /**
   * Builds a search {@link Node} for the given action sequence: runs the simulation
   * and computes a lexicographically-prioritized heuristic score (see {@link runSolver}
   * doc comment for the priority ordering)
   * @param actions The action sequence to simulate and score
   * @returns Returns a {@link Node} containing the simulated result and heuristic score
   */
  const buildNode = (actions: CraftingAction[]): Node => {
    const result = evaluate(actions);
    nodesEvaluated++;
    const sim = result.simulation;
    const cappedQuality = Math.min(sim.quality, recipe.quality);
    const qualityComplete = cappedQuality >= recipe.quality;
    const progressComplete = result.success;

    let score: number;

    if (progressComplete) {
      // Any completed rotation always outranks any incomplete one (1e12 floor),
      // then ranked by quality, then by fewer steps as a tiebreaker
      score = 1e12 + cappedQuality * 1e3 - actions.length;
    } else {
      const qualityFraction = cappedQuality / recipe.quality;
      const progressFraction = Math.min(sim.progression / recipe.progress, 1);

      // Penalize letting durability drop dangerously low before the craft is done
      // to encourage timely use of Master's Mend / Manipulation / Immaculate Mend
      const durabilityRatio = sim.durability / recipe.durability;
      const durabilityPenalty = durabilityRatio < 0.3 ? (0.3 - durabilityRatio) * 2000 : 0;

      score = progressFraction * 400
            + qualityFraction * 400
            - durabilityPenalty
            - actions.length * 0.1
    }

    return {
      actions,
      result,
      score,
      qualityComplete,
      progressComplete,
      maxRemainingProgress: estimateMaxProgressPerStep(sim)
    };
  };

  /**
   * Serializes a node's active buffs (type, remaining duration, stack coun) into a
   * string, so nodes with materially different buff states are never merged together
   * during deduplication
   * @param simulation The simulation state to serialize active buffs from
   * @returns Returns a string uniquely representing the simulation's active buffs
   */
  const buffSignature = (simulation: any): string => {
    return simulation.buffs
      .map((b: any) => `${b.buff}:${Math.round(b.duration ?? 0)}:${b.stacks ?? 0}`)
      .sort()
      .join(',');
  };

  /**
   * Groups near-identical states together (rounded CP/durability/progress/quality
   * buckets plus exact buff signature and step count) so the beam doesn't fill up with
   * many near-duplicate branches, keeping only the highest-scoring one per bucket)
   * @param n The node to generate a deduplication key for
   * @returns Returns a string uniquely representing the node's state for deduplication purposes
   */
  const dedupKey = (n: Node): string => {
    const s = n.result.simulation;
    const cpBucket = Math.round(s.availableCP / 5);
    const durBucket = Math.round(s.durability / 5);
    const progBucket = Math.round(s.progression / (recipe.progress / 20 || 1));
    const qualBucket = Math.round(s.quality / (recipe.quality / 20 || 1));
    return `${cpBucket}:${durBucket}:${progBucket}:${qualBucket}:${n.actions.length}:${buffSignature(s)}`;
  };

  const root = buildNode([]);
  let best: Node | null = root.progressComplete ? root : null;
  let frontier: Node[] = root.progressComplete ? [] : [root];

  let depth = 0;
  for (; depth < maxSteps; depth++) {
    if (performance.now() - startTime > maxComputeMs) break;
    if (frontier.length === 0) break;

    const candidates: Node[] = [];
    const remainingDepth = maxSteps - depth;

    for (const node of frontier) {
      // Branch-and-bound: skip branches that cannot possibly complete the craft
      // within the remaining step budget, even under optimistic assumptions
      if (depth >= MIN_DEPTH_BEFORE_PRUNING) {
        const bestCaseFinalProgress = node.result.simulation.progression
          + node.maxRemainingProgress * remainingDepth * PRUNE_SAFETY_MULTIPLIER;
        if (bestCaseFinalProgress < recipe.progress) continue;
      }

      for (const action of candidateActions) {
        if (!action.canBeUsed(node.result.simulation, true)) continue;
        if (action.getSuccessRate(node.result.simulation) < 100) continue;
        if (action.getBaseCPCost(node.result.simulation) > node.result.simulation.availableCP) continue;

        if (isRedundantBuffActivation(action, node.result.simulation)) continue;

        const newActions = [...node.actions, action];
        const child = buildNode(newActions);

        if (child.result.simulation.durability < 0 || child.result.simulation.availableCP < 0) continue;

        if (child.progressComplete) {
          // A completed rotation is a dead end for further branching (the craft is
          // done). Only keep it as a potential final answer, never expand it further.
          if (!best || child.score > best.score) best = child;
          continue;
        }

        candidates.push(child);
      }

      if (performance.now() - startTime > maxComputeMs) break;
    }

    if (candidates.length === 0) break;

    const byBucket = new Map<string, Node>();
    for (const candidate of candidates) {
      const key = dedupKey(candidate);
      const existing = byBucket.get(key);
      if (!existing || candidate.score > existing.score) byBucket.set(key, candidate);
    }

    frontier = [...byBucket.values()].sort((a, b) => b.score - a.score).slice(0, beamWidth);

    onProgress?.({
      depth,
      bestQuality: best ? Math.min(best.result.simulation.quality, recipe.quality) : 0,
      bestSuccess: best !== null,
      qualityComplete: best?.qualityComplete ?? false,
      nodesEvaluated
    });

    // Nothing can improve on a completed rotation that already reached full quality
    if (best && best.qualityComplete) break;
  }

  if (best) {
    return best.actions;
  }

  console.warn('[solver-core] Beam search fand keine fertige Rotation, greife auf greedyFinish zurück.', {
    nodesEvaluated,
    depth,
    frontierSize: frontier.length
  });

  return greedyFinish(frontier[0]?.actions ?? [], evaluate, candidateActions, recipe, maxSteps);
}

/**
 * Safety-net fallback used only if the main beam search could not find any complete
 * rotation within its time/depth budget (should be rare given the pruning above).
 * Greedily appends the safe action with the highest immediate progress yield until
 * craft completes or no further safe, affordable action is available.
 * 
 * @param startActions Actions accumulated so far by the main search, used as the starting point
 *        to continue from rather than starting over
 * @param evaluate Simulation-evaluation function (see {@link runSolver}s 'evaluate')
 * @param candidateActions Pre-filtered pool of allowed actions to choose from
 * @param recipe The recipe/craft being solved for
 * @param maxSteps Hard step limit. The fallback will not exceed it.
 * @returns The resulting (possibly still incomplete, if truly unsolvable) action list
 */
function greedyFinish(
  startActions: CraftingAction[],
  evaluate: (actions: CraftingAction[]) => any,
  candidateActions: CraftingAction[],
  recipe: Craft,
  maxSteps: number
): CraftingAction[] {
  let actions = [...startActions];
  let result = evaluate(actions);

  while (!result.success && actions.length < maxSteps) {
    let bestAction: CraftingAction | null = null;
    let bestValue = -1;

    for (const action of candidateActions) {
      if (!action.canBeUsed(result.simulation, true)) continue;
      if (action.getSuccessRate(result.simulation) < 100) continue;
      if (action.getBaseCPCost(result.simulation) > result.simulation.availableCP) continue;
      const value = action.getBaseProgression ? action.getBaseProgression(result.simulation) : 0;
      if (value > bestValue) {
        bestValue = value;
        bestAction = action;
      }
    }

    if (!bestAction) break;
    actions = [...actions, bestAction];
    result = evaluate(actions);
  }

  return actions;
}