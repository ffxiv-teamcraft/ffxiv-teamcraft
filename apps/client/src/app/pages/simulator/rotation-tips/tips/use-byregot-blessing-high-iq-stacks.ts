import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { Buff, ByregotsBlessing, ByregotsBrow, SimulationResult } from '@ffxiv-teamcraft/simulator';

export class UseByregotBlessingHighIqStacks extends RotationTip {

  constructor() {
    super(RotationTipType.INFO, 'Use_byregot_blessing_high_iq_stacks');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return this.simulationHasAction(simulationResult, ByregotsBrow) && this.crafterHasActions(simulationResult, ByregotsBlessing);
  }

  matches(simulationResult: SimulationResult): boolean {
    const blessingIndex = simulationResult.steps.findIndex(step => step.action.is(ByregotsBrow));
    const clone = simulationResult.simulation.clone();
    clone.run(true, blessingIndex - 1);
    return clone.getBuff(Buff.INNER_QUIET) && clone.getBuff(Buff.INNER_QUIET).stacks > 6 && simulationResult.simulation.quality < simulationResult.simulation.recipe.quality;
  }

}
