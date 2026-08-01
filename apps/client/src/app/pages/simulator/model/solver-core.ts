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

export function runSolver(input: SolverInput, onProgress?: (p: SolverProgress) => void): CraftingAction[] {
  const { Simulation, registry, ActionType, Buff, recipe, stats, hqIngredients, beamWidth, maxSteps, maxComputeMs } = input;
  const startTime = performance.now();

  const candidateActions: CraftingAction[] = [
    ...registry.getActionsByType(ActionType.PROGRESSION),
    ...registry.getActionsByType(ActionType.QUALITY),
    ...registry.getActionsByType(ActionType.BUFF),
    ...registry.getActionsByType(ActionType.REPAIR),
    ...registry.getActionsByType(ActionType.OTHER),
    ...registry.getActionsByType(ActionType.CP_RECOVERY)
  ];
  const progressionActions = registry.getActionsByType(ActionType.PROGRESSION);
  const buffActions = registry.getActionsByType(ActionType.BUFF);
  const repairActions = registry.getActionsByType(ActionType.REPAIR);

  console.log('[solver-core] Buff action class names:', buffActions.map((a: any) => a.constructor?.name));
  console.log('[solver-core] Repair action class names:', repairActions.map((a: any) => a.constructor?.name));

  const evaluate = (actions: CraftingAction[]) => {
    const sim = new Simulation(recipe, actions, stats, hqIngredients || []);
    return sim.run(true, Infinity, true);
  };

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

  const findActiveBuff = (simulation: any, buffKeyName: string): any => {
    return simulation.buffs.find((b: any) => Buff[b.buff] === buffKeyName);
  };

  const isRedundantBuffActivation = (action: CraftingAction, simulation: any): boolean => {
    const buffKey = BUFF_ACTION_TO_BUFF_KEY[action.constructor?.name];
    if (!buffKey) return false;
    const active = findActiveBuff(simulation, buffKey);
    if (!active) return false;
    return (active.duration ?? 0) > 1;
  };

  let nodesEvaluated = 0;

  const buildNode = (actions: CraftingAction[]): Node => {
    const result = evaluate(actions);
    nodesEvaluated++;
    const sim = result.simulation;
    const cappedQuality = Math.min(sim.quality, recipe.quality);
    const qualityComplete = cappedQuality >= recipe.quality;
    const progressComplete = result.success;

    let score: number;

    if (progressComplete) {
      score = 1e12 + cappedQuality * 1e3 - actions.length;
    } else {
      const qualityFraction = cappedQuality / recipe.quality;
      const progressFraction = Math.min(sim.progression / recipe.progress, 1);

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

  const buffSignature = (simulation: any): string => {
    return simulation.buffs
      .map((b: any) => `${b.buff}:${Math.round(b.duration ?? 0)}:${b.stacks ?? 0}`)
      .sort()
      .join(',');
  };

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