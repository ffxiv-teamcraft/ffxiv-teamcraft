import {BuffAction} from '../buff-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';
import {WhistleEndProgressionTick} from '../progression/whistle-end-progression-tick';

export class WhistleWhileYouWork extends BuffAction {

    canBeUsed(simulation: Simulation): boolean {
        return simulation.crafterStats.specialist && !simulation.hasBuff(Buff.WHISTLE_WHILE_YOU_WORK);
    }

    getBaseCPCost(simulationState: Simulation): number {
        return 36;
    }

    protected getBuff(): Buff {
        return Buff.WHISTLE_WHILE_YOU_WORK;
    }

    getDuration(simulation: Simulation): number {
        return Infinity;
    }

    getIds(): number[] {
        return [100187, 100188, 100189, 100190, 100190, 100192, 100193, 100194];
    }

    protected getInitialStacks(): number {
        return 11;
    }

    protected getTick(): (simulation: Simulation, linear?: boolean) => void {
        return (simulation, linear) => {
            const stepsForGood = simulation.hasBuff(Buff.HEART_OF_CRAFTER) ? 2 : 4;
            // If we're in linear mode, consider one out of 4 steps as matching the condition, as you can't have each turn GOOD, ever.
            if ((linear && simulation.steps.length % stepsForGood === 0 && simulation.steps.length > 0)
                || (simulation.lastStep !== undefined && simulation.lastStep.state === 'GOOD')
                || (simulation.lastStep !== undefined && simulation.lastStep.state === 'EXCELLENT')) {
                simulation.getBuff(Buff.WHISTLE_WHILE_YOU_WORK).stacks--;
            }
            // When it reaches the end, progress is increased
            if (simulation.getBuff(Buff.WHISTLE_WHILE_YOU_WORK).stacks === 0) {
                const endTick = new WhistleEndProgressionTick();
                simulation.runAction(endTick, linear);
                simulation.removeBuff(Buff.WHISTLE_WHILE_YOU_WORK);
            }
        };
    }

}
