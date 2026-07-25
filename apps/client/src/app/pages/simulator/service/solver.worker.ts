/// <reference lib="webworker" />
import { runSolver } from "../model/solver-core";
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
  
    const actions = runSolver({
      Simulation: Simulator.Simulation,
      registry,
      ActionType: Simulator.ActionType,
      recipe: data.recipe,
      stats,
      hqIngredients: data.hqIngredients,
      beamWidth: data.beamWidth,
      maxSteps: data.maxSteps
    }, progress => {
      postMessage({ type: 'progress', progress });
    });

    // Runs the found simulation through the reliability-analysis like in
    // the CommunityRotationFinderPopupComponent
    const finalSimulation = new Simulator.Simulation(data.recipe, actions, stats, data.hqIngredients || []);
    finalSimulation.run(true, Infinity, true);
    const reliablity = finalSimulation.getReliabilityReport();

    postMessage({
      type: 'done',
      serializedActions: registry.serializeRotation(actions),
      reliablity
    });
  } catch (err) {
    postMessage({ type: 'error', message: (err as Error).message });
  }
});