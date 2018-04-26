import {PieceByPiece} from './piece-by-piece';
import {Simulation} from '../../../simulation/simulation';

/**
 * MuMe is just piece by piece with a different condition, cost and success rate.
 */
export class MuscleMemory extends PieceByPiece {

    canBeUsed(simulation: Simulation): boolean {
        return simulation.steps.length === 0;
    }

    getBaseCPCost(simulation: Simulation): number {
        return 6;
    }

    getBaseSuccessRate(simulation: Simulation): number {
        return 100;
    }

    getIds(): number[] {
        return [100136];
    }
}
