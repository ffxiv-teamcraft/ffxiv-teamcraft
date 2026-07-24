/// <reference lib="webworker" />
import { runSolver, SolverInput } from "../model/solver-core";
import { CrafterStats, Simulation, CraftingActionsRegistry, ActionType } from "@ffxiv-teamcraft/simulator";

addEventListener('message', ({ data }) => {
  const stats = new CrafterStats(
    data.stats.jobId,
    data.stats.craftsmanship,
    data.stats.control,
    data.stats.cp,
    data.stats.specialist,
    data.stats.relicTool,
    data.stats.level,
    data.stats.levels
  );

  const registry = new CraftingActionsRegistry();

  const input: SolverInput = {
    Simulation,
    registry,
    ActionType,
    recipe: data.recipe,
    stats,
    hqIngredients: data.hqIngredients,
    beamWidth: data.beamWidth,
    maxSteps: data.maxSteps
  };

  const actions = runSolver(input, progress => {
    postMessage({ type: 'progress', progress });
  });

  postMessage({
    type: 'done',
    serializedActions: registry.serializeRotation(actions)
  });
});