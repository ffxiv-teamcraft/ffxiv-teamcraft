import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { SimulationResult } from '../../simulation/simulation-result';
import { SteadyHandII } from '../../model/actions/buff/steady-hand-ii';
import { SteadyHand } from '../../model/actions/buff/steady-hand';
import { Buff } from '../../model/buff.enum';

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
    return allsh1Indexes.some(sh2Index => {
      const actionsUsedWithSh1 = simulationResult.steps.slice(sh2Index, 5) || [];
      const clone = simulationResult.simulation.clone();
      clone.removeBuff(Buff.STEADY_HAND);
      const result = actionsUsedWithSh1.some(step => step.action.getSuccessRate(clone) < 80);
      if (result) {
        this.matchingIndex = sh2Index + 1;
      }
      return result;
    });
  }

  messageParams(simulationResult: SimulationResult): any {
    return { index: this.matchingIndex };
  }

}
