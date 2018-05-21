import {BuffAction} from '../buff-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';
import {CraftingJob} from '../../crafting-job.enum';

export class HeartOfTheCrafter extends BuffAction {

    getLevelRequirement(): { job: CraftingJob; level: number } {
        return {job: CraftingJob.ANY, level: 60};
    }

    _canBeUsed(simulation: Simulation): boolean {
        return simulation.crafterStats.specialist;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 45;
    }

    protected getBuff(): Buff {
        return Buff.HEART_OF_CRAFTER;
    }

    getDuration(simulation: Simulation): number {
        return 7;
    }

    getIds(): number[] {
        return [100179, 100180, 100181, 100182, 100183, 100184, 100185, 100186];
    }

    protected getInitialStacks(): number {
        return 0;
    }

    protected getTick(): (simulation: Simulation, linear?: boolean) => void {
        return undefined;
    }

}
