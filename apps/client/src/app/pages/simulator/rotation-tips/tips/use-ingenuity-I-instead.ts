import { RotationTip } from '../rotation-tip';
import { SimulationResult } from '../../simulation/simulation-result';
import { IngenuityII } from '../../model/actions/buff/ingenuity-ii';
import { Ingenuity } from '../../model/actions/buff/ingenuity';
import { RotationTipType } from '../rotation-tip-type';

export class UseIngenuityIInstead extends RotationTip {
  constructor() {
    super(RotationTipType.WARNING, 'Use_ingenuity_I_instead');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return this.simulationHasAction(simulationResult, IngenuityII);
  }

  matches(simulationResult: SimulationResult): boolean {
    const simulation = simulationResult.simulation.clone();
    simulation.actions = simulation.actions.map(action => {
      if (action.is(IngenuityII)) {
        return new Ingenuity();
      }
      return action;
    });
    const res = simulation.run(true);
    return res.success && res.hqPercent === simulationResult.hqPercent;
  }

}
