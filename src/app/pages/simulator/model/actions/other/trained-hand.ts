import {GeneralAction} from '../general-action';
import {Simulation} from '../../../simulation/simulation';
import {ActionType} from '../action-type';
import {Buff} from '../../buff.enum';

export class TrainedHand extends GeneralAction {

    canBeUsed(simulation: Simulation, linear?: boolean): boolean {
        return simulation.hasBuff(Buff.WHISTLE_WHILE_YOU_WORK) && simulation.hasBuff(Buff.INNER_QUIET) &&
            simulation.getBuff(Buff.WHISTLE_WHILE_YOU_WORK).stacks === simulation.getBuff(Buff.INNER_QUIET).stacks;
    }

    execute(simulation: Simulation): void {
        const baseQualityIncrease = this.getBaseQuality(simulation);
        const baseProgressIncrease = this.getBaseProgression(simulation);
        const qualityPotency = this.getPotency(simulation);
        let progressPotency = this.getPotency(simulation);
        if (simulation.getBuff(Buff.WHISTLE_WHILE_YOU_WORK).stacks % 3 === 0) {
            progressPotency += 50;
        }
        simulation.quality += Math.floor(baseQualityIncrease * qualityPotency / 100);
        simulation.progression += Math.floor(baseProgressIncrease * progressPotency / 100);
        if (simulation.getBuff(Buff.INNER_QUIET).stacks < 11) {
            simulation.getBuff(Buff.INNER_QUIET).stacks++;
        }
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 32;
    }

    getBaseDurabilityCost(simulationState: Simulation): number {
        return 10;
    }

    getBaseSuccessRate(simulationState: Simulation): number {
        return 80;
    }

    getIds(): number[] {
        return [100161, 100162, 100163, 100164, 100165, 1001666, 100167, 100168];
    }

    // Potency is the same for both quality and progression so let's use this.
    getPotency(simulation: Simulation): number {
        return 150;
    }

    getType(): ActionType {
        return ActionType.OTHER;
    }

}
