declare function postMessage(message: any): void;

import { Solver } from '@ffxiv-teamcraft/crafting-solver';
import { CrafterStats, CraftingActionsRegistry } from '@ffxiv-teamcraft/simulator';

addEventListener('message', ({ data }) => {
  const stats = new CrafterStats(
    data.stats.jobId,
    data.stats.craftsmanship,
    data.stats._control,
    data.stats.cp,
    data.stats.specialist,
    data.stats.level,
    data.stats.levels
  );
  const solver = new Solver(data.recipe, stats);
  postMessage(CraftingActionsRegistry.serializeRotation(solver.run(data.seed)));
});
