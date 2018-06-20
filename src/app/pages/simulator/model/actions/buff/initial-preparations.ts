import {BuffAction} from '../buff-action';
import {Buff} from '../../buff.enum';
import {Simulation} from '../../../simulation/simulation';
import {CraftingJob} from '../../crafting-job.enum';

export class InitialPreparations extends BuffAction {

    getWaitDuration(): number {
        return 3;
    }

    getLevelRequirement(): { job: CraftingJob; level: number } {
        return {job: CraftingJob.ANY, level: 69};
    }

    protected getBuff(): Buff {
        return Buff.INITIAL_PREPARATIONS;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 50;
    }

    getDuration(simulation: Simulation): number {
        return Infinity;
    }

    getIds(): number[] {
        return [100251, 100252, 100253, 100254, 100255, 100256, 100257, 100258];
    }

    _canBeUsed(simulation: Simulation): boolean {
        // Can only be used at first turn
        return super._canBeUsed(simulation) && simulation.steps.length === 0;
    }

    protected getInitialStacks(): number {
        return 0;
    }

    protected getTick(): (simulation: Simulation) => void {
        return undefined;
    }

}
