import {Simulation} from '../simulation/simulation';
import {Buff} from './buff.enum';

export class CrafterStats {

    constructor(
        public readonly jobId: number,
        public readonly craftsmanship: number,
        private _control: number,
        public readonly cp: number,
        public readonly specialist: boolean,
        public readonly level: number,
    ) {
    }

    public getControl(simulationState: Simulation): number {
        let control = this._control;
        // First of all, apply IQ control bonus
        if (simulationState.hasBuff(Buff.INNER_QUIET)) {
            // Minus one because stacks start at 1 but the first one doesn't count, the maximum buff is 2, not 2.2.
            const innerQuietStacks = simulationState.getBuff(Buff.INNER_QUIET).stacks - 1;
            control += 0.2 * innerQuietStacks * this._control;
        }
        // Then innovation, based on base control, not buffed one
        if (simulationState.hasBuff(Buff.INNOVATION)) {
            control += 0.5 * this._control;
        }
        return control;
    }
}
