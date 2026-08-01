/// <reference lib="webworker" />
import { runSolver } from "../model/solver-core";
import * as Simulator from "@ffxiv-teamcraft/simulator";

/**
 * Web Worker entry point for the crafting rotation solver. Runs entirely off the main
 * thread so the beam search (which can evaluate hunderds or thousands to millions of 
 * simulated crafting states) never blocks the UI.
 * 
 * Expects a single 'message' event carrying a plain-object payload (see
 * {@link SolverService.solve} for the exact shape sent), and replies with one or more
 * 'postMessage' calls of the following shapes:
 * - '{ type: 'progress', progress: SolverProgress }' - emitted periodically while searching
 * - '{ type: 'done', serializedActions, reliablity }' - emitted once with the final result
 * - '{ type: 'error', message }' - emitted if an exception occurs during the search
 */
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
  
    const registry = Simulator.CraftingActionsRegistry;
  
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
      maxComputeMs: data.maxComputeMs,
      shouldUseCosmicExploration: data.shouldUseCosmicExploration,
      shouldUseSpecialistCommands: data.shouldUseSpecialistCommands
    }, progress => {
      postMessage({ type: 'progress', progress });
    });

    // Runs the found simulation through the reliability-analysis like in
    // the CommunityRotationFinderPopupComponent, so the UI can display a confidence report
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