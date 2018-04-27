import {SpecialtyAction} from '../specialty-action';
import {Simulation} from '../../../simulation/simulation';
import {Buff} from '../../buff.enum';

export class SpecialtyReflect extends SpecialtyAction {

    canBeUsed(simulation: Simulation): boolean {
        return super.canBeUsed(simulation) && simulation.hasBuff(Buff.INNER_QUIET);
    }

    applyReflect(simulation: Simulation): void {
        simulation.getBuff(Buff.INNER_QUIET).stacks += 3;
        if (simulation.getBuff(Buff.INNER_QUIET).stacks > 11) {
            simulation.getBuff(Buff.INNER_QUIET).stacks = 11;
        }
    }

    getIds(): number[] {
        return [100267, 100268, 100269, 100270, 100271, 100272, 100273, 100274];
    }

}
