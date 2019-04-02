import { RotationTip } from '../rotation-tip';
import { InnerQuiet } from '../../model/actions/buff/inner-quiet';
import { RotationTipType } from '../rotation-tip-type';
import { SimulationResult } from '../../simulation/simulation-result';

export class UseInnerQuiet extends RotationTip {

  constructor() {
    super(RotationTipType.WARNING, 'Use_inner_quiet');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return simulationResult.steps.some(step => step.addedQuality > 0) && this.crafterHasActions(simulationResult, InnerQuiet);
  }

  matches(simulationResult: SimulationResult): boolean {
    return !simulationResult.steps.some(step => step.action.is(InnerQuiet));
  }

}
