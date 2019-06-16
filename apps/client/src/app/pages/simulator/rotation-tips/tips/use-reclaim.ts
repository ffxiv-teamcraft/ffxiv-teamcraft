import { RotationTip } from '../rotation-tip';
import { RotationTipType } from '../rotation-tip-type';
import { Reclaim, SimulationResult } from '@ffxiv-teamcraft/simulator';

export class UseReclaim extends RotationTip {

  constructor() {
    super(RotationTipType.INFO, 'Use_reclaim');
  }

  canBeAppliedTo(simulationResult: SimulationResult): boolean {
    return simulationResult.success && this.crafterHasActions(simulationResult, Reclaim);
  }

  matches(simulationResult: SimulationResult): boolean {
    return simulationResult.simulation.availableCP > new Reclaim().getBaseCPCost(simulationResult.simulation);
  }

}
