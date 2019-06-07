import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { SimulationResult } from '../../simulation/simulation-result';
import { SpecialtyReflect } from '../../model/actions/other/specialty-reflect';

export class UseReflectEarlier extends RotationTip {

  constructor() {
    super(RotationTipType.INFO, 'Use_reflect_earlier');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return simulationResult.steps.some(step => step.action.is(SpecialtyReflect));
  }

  matches(simulationResult: SimulationResult): boolean {
    const reflectIndex = simulationResult.steps.findIndex(step => step.action.is(SpecialtyReflect));
    const qualityIndex = simulationResult.steps.findIndex(step => step.addedQuality > 0);
    return reflectIndex > qualityIndex;
  }

}
