import { ActionResult } from '@ffxiv-teamcraft/simulator';

export interface CraftingReplayStep extends Omit<ActionResult, 'action' | 'skipped' | 'cpDifference'> {
  action: number;
}
