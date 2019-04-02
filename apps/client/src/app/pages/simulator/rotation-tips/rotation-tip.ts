import { SimulationResult } from '../simulation/simulation-result';
import { RotationTipType } from './rotation-tip-type';

export abstract class RotationTip {

  public abstract matches(simulationResult: SimulationResult): boolean;

  public abstract canBeAppliedTo(simulationResult: SimulationResult): boolean;

  protected constructor(public readonly type: RotationTipType, public readonly message: string) {
  }

  public messageParams(simulationResult: SimulationResult): any {
    return {};
  }
}
