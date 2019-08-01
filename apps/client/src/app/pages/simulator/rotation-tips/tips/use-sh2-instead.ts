import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import {
  Buff,
  FocusedSynthesis,
  FocusedTouch, Observe,
  SimulationResult,
  SteadyHand,
  SteadyHandII
} from '@ffxiv-teamcraft/simulator';
import actions from '@angular/fire/schematics/deploy/actions';

export class UseSh2Instead extends RotationTip {

  private matchingIndex: number;

  constructor() {
    super(RotationTipType.INFO, 'Use_sh2_instead');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return this.simulationHasAction(simulationResult, SteadyHand) && this.crafterHasActions(simulationResult, SteadyHandII);
  }

  matches(simulationResult: SimulationResult): boolean {
    const allsh1Indexes = this.getAllActionIndexes(simulationResult, SteadyHand);
    return allsh1Indexes.some(sh1Index => {
      const actionsUsedWithSh1 = simulationResult.steps.slice(sh1Index, sh1Index + 5) || [];
      const clone = simulationResult.simulation.clone();
      clone.removeBuff(Buff.STEADY_HAND);
      const result = actionsUsedWithSh1.some((step, index) => {
        if (index > 0 &&
          (step.action.is(FocusedSynthesis) || step.action.is(FocusedTouch))
          && actionsUsedWithSh1[index - 1].action.is(Observe)) {
          return false;
        }
        return step.action.getSuccessRate(clone) < 80;
      });
      if (result) {
        this.matchingIndex = sh1Index;
      }
      return result;
    });
  }

  messageParams(simulationResult: SimulationResult): any {
    return { index: this.matchingIndex };
  }

}
