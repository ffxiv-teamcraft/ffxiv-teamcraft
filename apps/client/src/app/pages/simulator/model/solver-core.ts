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
}

interface Node {
  actions: CraftingAction[];
  result: any;
  score: number;
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
    return sim.run(true);
  };

  const score = (result: any): number => {
    const cappedQuality = Math.min(result.simulation.quality, recipe.quality);
    const successBonus = result.success ? 1_000_000_000 : 0;
    return successBonus + cappedQuality * 1000 - result.steps.length;
  };

  let frontier: Node[] = [{ actions: [], result: evaluate([]), score: -Infinity}];
  let best: Node | null = null;

  for (let depth = 0; depth < maxSteps; depth++) {
    const candidates: Node[] = [];

    for (const node of frontier) {
      if (node.result.success) {
        if (!best || node.score > best.score) best = node;
        continue;
      }

      for (const action of candidateActions) {
        if (!action.canBeUsed(node.result.simulation, true)) continue;

        const newActions = [...node.actions, action];
        const result = evaluate(newActions);

        if (result.simulation.durability < 0 || result.simulation.availableCP < 0) continue;

        candidates.push({ actions: newActions, result, score: score(result) });
      }
    }

    if (candidates.length === 0) break;

    candidates.sort((a, b) => b.score - a.score);
    frontier = candidates.slice(0, beamWidth);

    if (frontier[0].result.success && (!best || frontier[0].score > best.score)) {
      best = frontier[0];
    }

    onProgress?.({
      depth,
      bestQuality: Math.min(frontier[0].result.simulation.quality, recipe.quality),
      bestSuccess: frontier.some(f => f.result.success)
    });
  }

  return (best ?? frontier[0]).actions;
}