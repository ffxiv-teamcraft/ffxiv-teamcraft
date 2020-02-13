import { RotationTip } from '../rotation-tip';
import { Reuse, SimulationResult } from '@ffxiv-teamcraft/simulator';
import { RotationTipType } from '../rotation-tip-type';

export class UseReuse extends RotationTip {
  constructor() {
    super(RotationTipType.INFO, 'Use_reuse');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return simulationResult.success && !this.simulationHasAction(simulationResult, Reuse);
  }

  matches(simulationResult: SimulationResult): boolean {
    return simulationResult.hqPercent === 100 &&
      simulationResult.simulation.availableCP > new Reuse().getCPCost(simulationResult.simulation);
  }

}
