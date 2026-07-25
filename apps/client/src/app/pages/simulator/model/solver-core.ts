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
}

export interface SolverProgress {
  depth: number;
  bestQuality: number;
  bestSuccess: boolean;
  qualityComplete: boolean;
}

interface Node {
  actions: CraftingAction[];
  result: any;
  score: number;
  qualityComplete: boolean;
  progressComplete: boolean;
}

export function runSolver(input: SolverInput, onProgress?: (p: SolverProgress) => void): CraftingAction[] {
  const { Simulation, registry, ActionType, recipe, stats, hqIngredients, beamWidth, maxSteps } = input;

  const candidateActions: CraftingAction[] = [
    ...registry.getActionsByType(ActionType.PROGRESSION),
    ...registry.getActionsByType(ActionType.QUALITY),
    ...registry.getActionsByType(ActionType.BUFF),
    ...registry.getActionsByType(ActionType.REPAIR),
    ...registry.getActionsByType(ActionType.OTHER),
    ...registry.getActionsByType(ActionType.CP_RECOVERY)
  ];

  const evaluate = (actions: CraftingAction[]) => {
    const sim = new Simulation(recipe, actions, stats, hqIngredients || []);
    return sim.run(true, Infinity, true);
  };

  const buildNode = (actions: CraftingAction[]): Node => {
    const result = evaluate(actions);
    const cappedQuality = Math.min(result.simulation.quality, recipe.quality);
    const qualityComplete = cappedQuality >= recipe.quality;
    const progressComplete = result.success;

    let score: number;
    if (qualityComplete && progressComplete) {
      score = 1e15 - result.steps.length;
    } else if (qualityComplete) {
      score = 1e12 + cappedQuality * 1000 - result.steps.length;
    } else if (progressComplete) {
      score = 1e9 + cappedQuality * 1000 - result.steps.length;
    } else {
      score = cappedQuality * 1000 - result.steps.length;
    }

    return { actions, result, score, qualityComplete, progressComplete };
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

  for (let depth = 0; depth < maxSteps; depth++) {
    const candidates: Node[] = [];

    for (const node of frontier) {
      if (node.progressComplete) {
        if (!best || node.score > best.score) best = node;
        continue;
      }

      for (const action of candidateActions) {
        if (!action.canBeUsed(node.result.simulation, true)) continue;
        // SAFE MODE: Only actions with 100% success are allowed
        if (action.getSuccessRate(node.result.simulation) < 100) continue;

        const newActions = [...node.actions, action];
        const child = buildNode(newActions);

        if (child.result.simulation.durability < 0 || child.result.simulation.availableCP < 0) continue;

        candidates.push(child);
      }
    }

    if (candidates.length === 0) break;

    const byBucket = new Map<string, Node>();
    for (const c of candidates) {
      const key = dedupKey(c);
      const existing = byBucket.get(key);
      if (!existing || c.score > existing.score) byBucket.set(key, c);
    }

    frontier = [...byBucket.values()].sort((a, b) => b.score - a.score).slice(0, beamWidth);

    if (frontier[0].progressComplete && (!best || frontier[0].score > best.score)) {
      best = frontier[0];
    }

    onProgress?.({
      depth,
      bestQuality: Math.min(frontier[0].result.simulation.quality, recipe.quality),
      bestSuccess: frontier.some(f => f.progressComplete),
      qualityComplete: frontier[0].qualityComplete
    });

    // Early exit: if quality is full AND craft is finished, nothing more is to be improved
    if (best && best.qualityComplete && best.progressComplete) break;
  }

  return (best ?? frontier[0]).actions;
}