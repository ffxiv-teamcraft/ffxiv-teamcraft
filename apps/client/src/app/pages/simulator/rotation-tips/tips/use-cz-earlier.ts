import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { SimulationResult } from '../../simulation/simulation-result';
import { ComfortZone } from '../../model/actions/buff/comfort-zone';

export class UseCzEarlier extends RotationTip {

  constructor() {
    super(RotationTipType.INFO, 'Use_cz_earlier');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return simulationResult.steps.some(step => step.action.is(ComfortZone));
  }

  matches(simulationResult: SimulationResult): boolean {
    return simulationResult.steps.findIndex(step => step.action.is(ComfortZone)) > 3
      || simulationResult.steps.slice(-8).some(step => step.action.is(ComfortZone));
  }

}
