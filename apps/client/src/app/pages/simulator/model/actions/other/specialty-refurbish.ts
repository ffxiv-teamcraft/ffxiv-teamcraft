import { SpecialtyAction } from '../specialty-action';
import { Simulation } from '../../../simulation/simulation';

export class SpecialtyRefurbish extends SpecialtyAction {

  applyReflect(simulation: Simulation): void {
    simulation.availableCP += 65;
    if (simulation.availableCP > simulation.maxCP) {
      simulation.availableCP = simulation.maxCP;
    }
  }

  getIds(): number[] {
    return [100267, 100268, 100269, 100270, 100271, 100272, 100273, 100274];
  }

}
