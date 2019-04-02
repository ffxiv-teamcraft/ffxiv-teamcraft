import { RotationTip } from '../rotation-tip';
import { SimulationResult } from '../../simulation/simulation-result';
import { RotationTipType } from '../rotation-tip-type';

export class SimpleTip extends RotationTip {
  constructor(private _matches: (simulationResult: SimulationResult) => boolean,
              public type: RotationTipType,
              public message: string,
              public _messageParams: (simulationResult: SimulationResult) => any = () => {
              }) {
    super(type, message);
  }

  matches(simulationResult: SimulationResult): boolean {
    return this._matches(simulationResult);
  }

  messageParams(simulationResult: SimulationResult): any {
    return this._messageParams(simulationResult)
  }
}
