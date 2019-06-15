import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { Buff, SimulationResult, SteadyHandII } from '@ffxiv-teamcraft/simulator';

export class UseSh1Instead extends RotationTip {

  private matchingIndex: number;

  constructor() {
    super(RotationTipType.INFO, 'Use_sh1_instead');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return this.simulationHasAction(simulationResult, SteadyHandII);
  }

  matches(simulationResult: SimulationResult): boolean {
    const allsh2Indexes = this.getAllActionIndexes(simulationResult, SteadyHandII);
    return allsh2Indexes.some(sh2Index => {
      const actionsUsedWithSh2 = simulationResult.steps.slice(sh2Index, sh2Index + 5) || [];
      const clone = simulationResult.simulation.clone();
      clone.removeBuff(Buff.STEADY_HAND_II);
      const result = !actionsUsedWithSh2.some(step => step.action.getSuccessRate(clone) < 80);
      if (result) {
        this.matchingIndex = sh2Index;
      }
      return result;
    });
  }

  messageParams(simulationResult: SimulationResult): any {
    return { index: this.matchingIndex };
  }

}
