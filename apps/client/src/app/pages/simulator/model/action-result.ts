import { CraftingAction } from './actions/crafting-action';
import { SimulationFailCause } from './simulation-fail-cause.enum';

export interface ActionResult {
  // Action used
  action: CraftingAction;
  // Did the success hit?
  success: boolean;
  // If it failed, why?
  failCause?: SimulationFailCause;
  // Amount of progression added to the craft
  addedProgression: number;
  // Amount of quality added to the craft
  addedQuality: number;
  // CP added to the craft (negative if removed)
  cpDifference: number;
  // Solidity added to the craft (negative if removed)
  solidityDifference: number;
  // If the action is skipped because the craft is finished
  skipped: boolean;
  // State of the step
  state: 'NORMAL' | 'EXCELLENT' | 'GOOD' | 'POOR';

  afterBuffTick?: {
    // Amount of progression added to the craft
    addedProgression: number;
    // Amount of quality added to the craft
    addedQuality: number;
    // CP added to the craft (negative if removed)
    cpDifference: number;
    // Solidity added to the craft (negative if removed)
    solidityDifference: number;
  }
}
