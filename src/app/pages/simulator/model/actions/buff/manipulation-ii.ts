import {BuffAction} from '../buff-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';
import {ActionType} from '../action-type';
import {CraftingJob} from '../../crafting-job.enum';

export class ManipulationII extends BuffAction {

    getLevelRequirement(): { job: CraftingJob; level: number } {
        return {job: CraftingJob.ANY, level: 65};
    }

    protected getOverrides(): Buff[] {
        return super.getOverrides().concat(Buff.MANIPULATION);
    }

    public getType(): ActionType {
        return ActionType.REPAIR;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 96;
    }

    protected getBuff(): Buff {
        return Buff.MANIPULATION_II;
    }

    getDuration(simulation: Simulation): number {
        return 8;
    }

    getIds(): number[] {
        return [4574, 4575, 4576, 4577, 4578, 4579, 4580, 4581];
    }

    protected getInitialStacks(): number {
        return 0;
    }

    protected getTick(): (simulation: Simulation) => void {
        return (simulation: Simulation) => {
            simulation.repair(5);
        };
    }

}
