/// <reference lib="webworker" />
import { runSolver } from "../model/solver-core";
import * as Simulator from "@ffxiv-teamcraft/simulator";

addEventListener('message', ({ data }) => {
  console.log('[solver.worker] received message', data);
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
    console.log('[solver.worker] stats built', stats);
  
    const registry = Simulator.CraftingActionsRegistry;
    console.log('[solver-core] Buff enum keys:', Object.keys(Simulator.Buff));
  
    const actions = runSolver({
      Simulation: Simulator.Simulation,
      registry,
      ActionType: Simulator.ActionType,
      Buff: Simulator.Buff,
      recipe: data.recipe,
      stats,
      hqIngredients: data.hqIngredients,
      beamWidth: data.beamWidth,
      maxSteps: data.maxSteps,
      maxComputeMs: data.maxComputeMs
    }, progress => {
      console.log('[solver.worker] progress', progress);
      postMessage({ type: 'progress', progress });
    });

    console.log('[solver.worker] runSolver finished, actions.length =', actions.length);

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
    console.error('[solver.worker] CAUGHT ERROR', err, (err as Error)?.stack);
    postMessage({ type: 'error', message: (err as Error).message });
  }
});