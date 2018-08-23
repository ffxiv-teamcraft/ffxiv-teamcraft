import { SpecialtyAction } from '../specialty-action';
import { Simulation } from '../../../simulation/simulation';

export class SpecialtyReinforce extends SpecialtyAction {

  applyReflect(simulation: Simulation): void {
    simulation.repair(25);
  }

  getIds(): number[] {
    return [100259, 100260, 100261, 100262, 100263, 100264, 100265, 100266];
  }

}
