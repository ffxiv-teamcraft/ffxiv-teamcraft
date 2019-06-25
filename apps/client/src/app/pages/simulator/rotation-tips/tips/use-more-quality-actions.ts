import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { SimulationResult } from '@ffxiv-teamcraft/simulator';

export class UseMoreQualityActions extends RotationTip {

  constructor() {
    super(RotationTipType.INFO, 'Use_more_quality_actions');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return simulationResult.success && simulationResult.hqPercent < 100 && simulationResult.simulation.durability > 0;
  }

  matches(simulationResult: SimulationResult): boolean {
    return true;
  }

}
