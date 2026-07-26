import { Craft, CraftingAction, CrafterStats } from '@ffxiv-teamcraft/simulator';

export interface SolverInput {
  Simulation: any;
  registry: any;
  ActionType: any;
  Buff: any;
  recipe: Craft;
  stats: CrafterStats;
  hqIngredients?: { id: number; amount: number }[];
  beamWidth: number;
  maxSteps: number;
  maxComputeMs: number;
}

export interface SolverProgress {
  depth: number;
  bestQuality: number;
  bestSuccess: boolean;
  qualityComplete: boolean;
  nodesEvaluated: number;
}

interface Node {
  actions: CraftingAction[];
  result: any;
  score: number;
  qualityComplete: boolean;
  progressComplete: boolean;
  maxRemainingProgress: number;
}

const PRUNE_SAFETY_MULTIPLIER = 3;
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
  const qualityActions = registry.getActionsByType(ActionType.QUALITY);

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

  const estimateMaxQualityPerStep = (simulation: any): number => {
    let max = 0;
    for (const action of qualityActions) {
      if (!action.canBeUsed(simulation, true)) continue;
      if (action.getSuccessRate(simulation) < 100) continue;
      if (!action.getBaseQuality) continue;
      const value = action.getBaseQuality(simulation);
      if (value > max) max = value;
    }
    return max;
  };

  const findActiveBuff = (simulation: any, buffKeyName: string): any => {
    return simulation.buffs.find((b: any) => Buff[b.buff] === buffKeyName);
  };

  let nodesEvaluated = 0;

  const buildNode = (actions: CraftingAction[]): Node => {
    const result = evaluate(actions);
    nodesEvaluated++;
    const sim = result.simulation;
    const cappedQuality = Math.min(sim.quality, recipe.quality);
    const qualityComplete = cappedQuality >= recipe.quality;
    const progressComplete = result.success;

    const qualityFraction = cappedQuality / recipe.quality;
    const progressFraction = Math.min(sim.progression / recipe.progress, 1);
    const stepsUsedFraction = actions.length / maxSteps;
    const urgency = 1 + stepsUsedFraction * 3;

    let buffPotential = 0;
    const maxQualityStep = estimateMaxQualityPerStep(sim);
    const maxProgressStep = estimateMaxProgressPerStep(sim);

    const greatStrides = findActiveBuff(sim, 'GREAT_STRIDES');
    if (greatStrides) {
      buffPotential += maxQualityStep * 1.0;
    }
    const innovation = findActiveBuff(sim, 'INNOVATION');
    if (innovation) {
      buffPotential += maxQualityStep * 0.5 * Math.min(innovation.duration ?? 1, remainingStepsGuess(maxSteps, actions.length));
    }
    const veneration = findActiveBuff(sim, 'VENERATION');
    if (veneration) {
      buffPotential += maxProgressStep * 0.5 * Math.min(veneration.duration ?? 1, remainingStepsGuess(maxSteps, actions.length));
    }

    const score = progressComplete
          ? 1e9 + qualityFraction * 1e6 - result.steps.length
          : progressFraction * 500 * urgency + qualityFraction * 300 - result.steps.length * 0.1 + buffPotential * 0.4;

    return {
      actions,
      result,
      score,
      qualityComplete,
      progressComplete,
      maxRemainingProgress: maxProgressStep
    };
  };

  const buffSignature = (simulation: any): string => {
    return simulation.buffs
      .map((b: any) => `${b.buff}:${Math.round((b.duration ?? 0))}:${b.stacks ?? 0}`)
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

  return greedyFinish(frontier[0]?.actions ?? [], evaluate, candidateActions, recipe, maxSteps);
}

function remainingStepsGuess(maxSteps: number, usedSteps: number): number {
  return Math.max(1, maxSteps - usedSteps);
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