import {BuffAction} from '../buff-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';
import {CraftingJob} from '../../crafting-job.enum';

export class IngenuityII extends BuffAction {

    getLevelRequirement(): { job: CraftingJob; level: number } {
        return {job: CraftingJob.BSM, level: 50};
    }

    protected getOverrides(): Buff[] {
        return super.getOverrides().concat(Buff.INGENUITY);
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 32;
    }

    protected getBuff(): Buff {
        return Buff.INGENUITY_II;
    }

    getDuration(simulation: Simulation): number {
        return 5;
    }

    getIds(): number[] {
        return [283];
    }

    protected getInitialStacks(): number {
        return 0;
    }

    protected getTick(): (simulation: Simulation) => void {
        return undefined;
    }
}
