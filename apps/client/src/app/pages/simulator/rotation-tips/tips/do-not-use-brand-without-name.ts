import { RotationTip } from '../rotation-tip';
import { BrandOfTheElements, NameOfTheElements, SimulationResult } from '@ffxiv-teamcraft/simulator';
import { RotationTipType } from '../rotation-tip-type';

export class DoNotUseBrandWithoutName extends RotationTip {

  constructor() {
    super(RotationTipType.WARNING, 'Do_not_use_brand_without_name');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return this.simulationHasAction(simulationResult, BrandOfTheElements);
  }

  matches(simulationResult: SimulationResult): boolean {
    const nameIndex = simulationResult.steps.findIndex(step => step.action.is(NameOfTheElements));
    return nameIndex < 0 || simulationResult.steps.some((step, index) => {
      return step.action.is(BrandOfTheElements) && (index < nameIndex || index > nameIndex + 3);
    });
  }

}
