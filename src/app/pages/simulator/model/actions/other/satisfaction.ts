import {CraftingAction} from '../crafting-action';
import {Simulation} from '../../../simulation/simulation';
import {ActionType} from '../action-type';
import {Buff} from '../../buff.enum';
import {CraftingJob} from '../../crafting-job.enum';

export class Satisfaction extends CraftingAction {

    getLevelRequirement(): { job: CraftingJob; level: number } {
        return {job: CraftingJob.ANY, level: 55};
    }

    _canBeUsed(simulationState: Simulation, linear?: boolean): boolean {
        return simulationState.crafterStats.specialist && simulationState.hasBuff(Buff.WHISTLE_WHILE_YOU_WORK)
            && simulationState.getBuff(Buff.WHISTLE_WHILE_YOU_WORK).stacks % 3 === 0;
    }

    execute(simulation: Simulation): void {
        simulation.availableCP += 15;
        if (simulation.availableCP > simulation.maxCP) {
            simulation.availableCP = simulation.maxCP;
        }
        simulation.getBuff(Buff.WHISTLE_WHILE_YOU_WORK).stacks--;
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 0;
    }

    getDurabilityCost(simulationState: Simulation): number {
        return 0;
    }

    getIds(): number[] {
        return [100169, 100170, 100171, 100172, 100170, 100174, 100175, 100176];
    }

    getSuccessRate(simulationState: Simulation): number {
        return 100;
    }

    getType(): ActionType {
        return ActionType.CP_RECOVERY;
    }

}
