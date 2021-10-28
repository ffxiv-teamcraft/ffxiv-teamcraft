import { RotationTip } from '../rotation-tip';
import { InnerQuiet, Reflect, SimulationResult, TrainedEye } from '@ffxiv-teamcraft/simulator';
import { RotationTipType } from '../rotation-tip-type';

export class UseInnerQuiet extends RotationTip {

  constructor() {
    super(RotationTipType.WARNING, 'Use_inner_quiet');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return simulationResult.steps.some(step => step.addedQuality > 0)
      && this.crafterHasActions(simulationResult, InnerQuiet)
      && !this.simulationHasAction(simulationResult, TrainedEye);
  }

  matches(simulationResult: SimulationResult): boolean {
    return !simulationResult.steps.some(step => step.action.is(InnerQuiet) || step.action.is(Reflect));
  }

}
