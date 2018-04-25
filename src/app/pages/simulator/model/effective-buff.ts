import {Buff} from './buff.enum';
import {Simulation} from '../simulation/simulation';

export abstract class EffectiveBuff {
    duration: number;
    stacks: number;
    buff: Buff;

    abstract tick(simulationState: Simulation): void;
}

