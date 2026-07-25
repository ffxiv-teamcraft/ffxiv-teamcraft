/// <reference lib="webworker" />
import { runSolver, SolverInput } from "../model/solver-core";
import * as Simulator from "@ffxiv-teamcraft/simulator";

addEventListener('message', ({ data }) => {
  try {
    const stats = new Simulator.CrafterStats(
      data.stats.jobId,
      data.stats.craftsmanship,
      data.stats.control,
      data.stats.cp,
      data.stats.specialist,
      data.stats.relicTool,
      data.stats.level,
      data.stats.levels
    );
  
    const registry = Simulator.CraftingActionsRegistry;
  
    console.log('[solver.worker] candidateActions:',
      registry.getActionsByType(Simulator.ActionType.PROGRESSION).length,
      registry.getActionsByType(Simulator.ActionType.QUALITY).length);
  
    const input: SolverInput = {
      Simulation: Simulator.Simulation,
      registry,
      ActionType: Simulator.ActionType,
      recipe: data.recipe,
      stats,
      hqIngredients: data.hqIngredients,
      beamWidth: data.beamWidth,
      maxSteps: data.maxSteps
    };
  
    const actions = runSolver(input, progress => {
      console.log('[solver.worker] progress')
      postMessage({ type: 'progress', progress });
    });
  
    postMessage({
      type: 'done',
      serializedActions: registry.serializeRotation(actions)
    });
  } catch (err) {
    console.log('[solver.worker] error', err);
    postMessage({ type: 'error', message: (err as Error).message});
  }
});