import { Craft, CraftingAction, CrafterStats } from '@ffxiv-teamcraft/simulator';

export interface SolverInput {
  Simulation: any;
  registry: any;
  ActionType: any;
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

export function runSolver(input: SolverInput, onProgress?: (p: SolverProgress) => void): CraftingAction[] {
  const { Simulation, registry, ActionType, recipe, stats, hqIngredients, beamWidth, maxSteps, maxComputeMs } = input;
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

  const evaluate = (actions: CraftingAction[]) => {
    const sim = new Simulation(recipe, actions, stats, hqIngredients || []);
    return sim.run(true, Infinity, true); // Always runs in Safe Mode to ensure reliable Actions
  };

  // Best-Case Guessing: strongest Progress-Action in this state, calculated once
  const estimateMaxProgressPerStep = (simulation: any): number => {
    let max = 0;
    for (const action of progressionActions) {
      if (!action.canBeUsed(simulation, true)) continue;
      if (action.getSuccessRate(simulation) < 100) continue;
      const value = action.getBaseProgression(simulation);
      if (value > max) max = value;
    }
    return max;
  }

  let nodesEvaluated = 0;

  const buildNode = (actions: CraftingAction[]): Node => {
    const result = evaluate(actions);
    nodesEvaluated++;
    const cappedQuality = Math.min(result.simulation.quality, recipe.quality);
    const qualityComplete = cappedQuality >= recipe.quality;
    const progressComplete = result.success;

    const score = progressComplete
          ? 1e9 + cappedQuality * 1000 - result.steps.length
          : cappedQuality * 500 + (result.simulation.progression / recipe.progress) * 500 - result.steps.length * 0.1;

    return {
      actions,
      result,
      score,
      qualityComplete,
      progressComplete,
      maxRemainingProgress: estimateMaxProgressPerStep(result.simulation)
    };
  };

  // Lightweight Step to a Pareto-Front:
  // Combine Steps with (almost) same (CP, Durability, Progress, Quality)
  // to prevent an overflow of duplicates in the Beam
  const dedupKey = (n: Node): string => {
    const s = n.result.simulation;
    const cpBucket = Math.round(s.availableCP / 5);
    const durBucket = Math.round(s.durability / 5);
    const progBucket = Math.round(s.progression / (recipe.progress / 20 || 1));
    const qualBucket = Math.round(s.quality / (recipe.quality / 20 || 1));
    return `${cpBucket}:${durBucket}:${progBucket}:${qualBucket}:${n.actions.length}`;
  };

  let frontier: Node[] = [buildNode([])];
  let best: Node | null = null;

  let depth = 0;
  for (; depth < maxSteps; depth++) {
    if (performance.now() - startTime > maxComputeMs) break;

    const candidates: Node[] = [];
    const remainingDepth = maxSteps - depth;

    for (const node of frontier) {
      if (node.progressComplete) {
        if (!best || node.score > best.score) best = node;
        continue;
      }

      // Branch and Bound: Can this branch be finished?
      const bestCaseFinalProgress = node.result.simulation.progress + node.maxRemainingProgress * remainingDepth;
      if (bestCaseFinalProgress < recipe.progress) continue; // Dead branch - throw away

      for (const action of candidateActions) {
        if (!action.canBeUsed(node.result.simulation, true)) continue;
        if (action.getSuccessRate(node.result.simulation) < 100) continue;

        const newActions = [...node.actions, action];
        const child = buildNode(newActions);

        if (child.result.simulation.durability < 0 || child.result.simulation.availableCP < 0) continue;

        candidates.push(child);
        if (child.progressComplete && (!best || child.score > best.score)) best = child;
      }

      if (performance.now() - startTime > maxComputeMs) break;
    }

    if (candidates.length === 0) break;

    const byBucket = new Map<string, Node>();
    for (const candidate of candidates) {
      const key = dedupKey(candidate);
      const existing = byBucket.get(key);
      if (!existing || c.score > existing.score) byBucket.set(key, candidate);
    }

    frontier = [...byBucket.values()].sort((a, b) => b.score - a.score).slice(0, beamWidth);

    onProgress?.({
      depth,
      bestQuality: best ? Math.min(best.result.simulation.quality, recipe.quality) : 0,
      bestSuccess: best !== null,
      qualityComplete: best?.qualityComplete ?? false,
      nodesEvaluated
    });

    if (best && best.qualityComplete) break; // Optimum reached: Finished + full Quality
  }

  if (best) {
    return best.actions;
  }

  // Security-net: If nothing finished can be found (shouldn't happen through pruning)
  // finish the craft greedy, but safe instead of returning a broken rotation
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
      const value = action.getBaseProgression ? action.getBaseProgression(result.simulation) : 0;
      if (value > bestValue) {
        bestValue = value;
        bestAction = action;
      }
    }

    if (!bestAction) break; // No safe Action available, cannot continue
    actions = [...actions, bestAction];
    result = evaluate(actions);
  }

  return actions;
}