import {CraftingAction} from '../crafting-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';
import {ActionType} from '../action-type';

export class Rumination extends CraftingAction {

    public getType(): ActionType {
        return ActionType.CP_RECOVERY;
    }

    canBeUsed(simulationState: Simulation): boolean {
        return simulationState.hasBuff(Buff.INNER_QUIET);
    }

    execute(simulation: Simulation): void {
        // Formulae from https://github.com/Ermad/ffxiv-craft-opt-web/blob/master/app/js/ffxivcraftmodel.js#L594
        simulation.availableCP += ((simulation.getBuff(Buff.INNER_QUIET).stacks - 1) * 21 -
            Math.pow((simulation.getBuff(Buff.INNER_QUIET).stacks - 1), 2) + 10) / 2;
        if (simulation.availableCP > simulation.maxCP) {
            simulation.availableCP = simulation.maxCP;
        }
        simulation.removeBuff(Buff.INNER_QUIET);
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 0;
    }

    getDurabilityCost(simulationState: Simulation): number {
        return 0;
    }

    getIds(): number[] {
        return [276];
    }

    getSuccessRate(simulationState: Simulation): number {
        return 100;
    }

}
