import { RotationTip } from '../rotation-tip';
import { SimulationResult } from '../../simulation/simulation-result';
import { IngenuityII } from '../../model/actions/buff/ingenuity-ii';
import { Ingenuity } from '../../model/actions/buff/ingenuity';
import { RotationTipType } from '../rotation-tip-type';

export class UseIngenuityIInstead extends RotationTip {
  constructor(){
    super(RotationTipType.WARNING, 'SIMULATOR.ROTATION_TIPS.Use_ingenuity_I_instead')
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return simulationResult.steps.some(step => step.action.is(IngenuityII));
  }

  matches(simulationResult: SimulationResult): boolean {
    const simulation = simulationResult.simulation.clone();
    simulation.actions = simulation.actions.map(action => {
      if (action.is(IngenuityII)) {
        return new Ingenuity();
      }
      return action;
    });
    return simulation.run(true).success;
  }

}
