import { Simulation } from '../simulation/simulation';
import { Buff } from './buff.enum';

export type CrafterLevels = [number, number, number, number, number, number, number, number];

export class CrafterStats {

  constructor(
    public readonly jobId: number,
    public craftsmanship: number,
    public _control: number,
    public cp: number,
    public readonly specialist: boolean,
    public readonly level: number,
    public readonly levels: CrafterLevels
  ) {
  }

  public getControl(simulationState: Simulation): number {
    let control = this._control;
    // First of all, apply IQ control bonus
    if (simulationState.hasBuff(Buff.INNER_QUIET)) {
      const innerQuietStacks = simulationState.getBuff(Buff.INNER_QUIET).stacks;
      control += 0.2 * (innerQuietStacks - 1) * this._control;
    }
    // Then innovation, based on base control, not buffed one
    if (simulationState.hasBuff(Buff.INNOVATION)) {
      control += 0.5 * this._control;
    }
    return control;
  }
}
