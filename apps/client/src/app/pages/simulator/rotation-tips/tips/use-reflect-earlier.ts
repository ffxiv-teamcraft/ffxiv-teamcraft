import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { SimulationResult, SpecialtyReflect } from '@ffxiv-teamcraft/simulator';

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
    return qualityIndex > -1 && reflectIndex > qualityIndex;
  }

}
