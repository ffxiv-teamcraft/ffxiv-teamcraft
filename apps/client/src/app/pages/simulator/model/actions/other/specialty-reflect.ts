import { SpecialtyAction } from '../specialty-action';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';

export class SpecialtyReflect extends SpecialtyAction {

  _canBeUsed(simulation: Simulation): boolean {
    return super._canBeUsed(simulation) && simulation.hasBuff(Buff.INNER_QUIET);
  }

  applyReflect(simulation: Simulation): void {
    simulation.getBuff(Buff.INNER_QUIET).stacks += 3;
    if (simulation.getBuff(Buff.INNER_QUIET).stacks > 11) {
      simulation.getBuff(Buff.INNER_QUIET).stacks = 11;
    }
  }

  getIds(): number[] {
    return [100275, 100276, 100277, 100278, 100279, 100280, 100281, 100282];
  }

}
