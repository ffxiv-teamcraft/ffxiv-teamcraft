import { RotationTip } from '../rotation-tip';
import { Reuse, SimulationResult } from '@ffxiv-teamcraft/simulator';
import { RotationTipType } from '../rotation-tip-type';

export class RequiresReuseToProc extends RotationTip {
  constructor() {
    super(RotationTipType.ERROR, 'Requires_reuse_to_proc');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return this.simulationHasAction(simulationResult, Reuse);
  }

  matches(simulationResult: SimulationResult): boolean {
    const simulation = simulationResult.simulation.clone();
    simulation.actions = simulation.actions.filter(action => !action.is(Reuse));
    const simulationWithoutReuse = simulation.run(true);
    return !simulationWithoutReuse.success && simulationResult.success;
  }

}
