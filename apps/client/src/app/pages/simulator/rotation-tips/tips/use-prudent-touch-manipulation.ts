import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { HastyTouch, Manipulation, PrudentTouch, SimulationResult } from '@ffxiv-teamcraft/simulator';

export class UsePrudentTouchManipulation extends RotationTip {

  constructor() {
    super(RotationTipType.INFO, 'Use_prudent_touch_manipulation');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return !this.simulationHasAction(simulationResult, PrudentTouch)
      && !this.simulationHasAction(simulationResult, Manipulation)
      && simulationResult.simulation.crafterStats.level >= 66;
  }

  matches(simulationResult: SimulationResult): boolean {
    return simulationResult.simulation.progression < simulationResult.simulation.recipe.progress
      && simulationResult.hqPercent > 1 && this.simulationHasAction(simulationResult, HastyTouch);
  }

}
