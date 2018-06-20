import {BuffAction} from '../buff-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';
import {CraftingJob} from '../../crafting-job.enum';

export class Ingenuity extends BuffAction {

    getLevelRequirement(): { job: CraftingJob; level: number } {
        return {job: CraftingJob.BSM, level: 15};
    }

    protected getOverrides(): Buff[] {
        return super.getOverrides().concat(Buff.INGENUITY_II);
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 24;
    }

    protected getBuff(): Buff {
        return Buff.INGENUITY;
    }

    getDuration(simulation: Simulation): number {
        return 5;
    }

    getIds(): number[] {
        return [277];
    }

    protected getInitialStacks(): number {
        return 0;
    }

    protected getTick(): (simulation: Simulation) => void {
        return undefined;
    }
}
