import {Buff} from './buff.enum';
import {Simulation} from '../simulation/simulation';

export interface EffectiveBuff {
    duration: number;
    stacks: number;
    buff: Buff;

    tick?: (simulationState: Simulation) => void;

    appliedStep: number;
}

