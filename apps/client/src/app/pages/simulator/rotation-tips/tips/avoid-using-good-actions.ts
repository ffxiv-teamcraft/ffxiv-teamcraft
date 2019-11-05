import { RotationTip } from '../rotation-tip';
import { IntensiveSynthesis, PreciseTouch, SimulationResult } from '@ffxiv-teamcraft/simulator';
import { RotationTipType } from '../rotation-tip-type';

export class AvoidUsingGoodActions extends RotationTip {

  constructor() {
    super(RotationTipType.WARNING, 'Avoid_using_good_actions');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return true;
  }

  matches(simulationResult: SimulationResult): boolean {
    return simulationResult.steps.some(step => {
      return step.action.is(PreciseTouch)
        || step.action.is(IntensiveSynthesis);
    });
  }

}
