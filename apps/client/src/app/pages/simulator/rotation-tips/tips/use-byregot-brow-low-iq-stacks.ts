import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { Buff, ByregotsBlessing, ByregotsBrow, SimulationResult } from '@ffxiv-teamcraft/simulator';

export class UseByregotBrowLowIqStacks extends RotationTip {

  constructor() {
    super(RotationTipType.INFO, 'Use_byregot_brow_low_iq_stacks');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return this.simulationHasAction(simulationResult, ByregotsBlessing) && this.crafterHasActions(simulationResult, ByregotsBrow);
  }

  matches(simulationResult: SimulationResult): boolean {
    const blessingIndex = simulationResult.steps.findIndex(step => step.action.is(ByregotsBlessing));
    const clone = simulationResult.simulation.clone();
    clone.run(true, blessingIndex - 1);
    return clone.getBuff(Buff.INNER_QUIET) && clone.getBuff(Buff.INNER_QUIET).stacks < 6 && simulationResult.simulation.quality < simulationResult.simulation.recipe.quality;
  }

}
