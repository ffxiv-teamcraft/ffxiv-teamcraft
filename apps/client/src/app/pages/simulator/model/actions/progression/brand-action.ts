import { ProgressAction } from '../progress-action';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';
import { RecipeElement } from '../../../../../model/garland-tools/recipe-element';

export abstract class BrandAction extends ProgressAction {

  abstract getBuffedBy(): Buff;

  abstract getElement(): RecipeElement;

  _canBeUsed(simulationState: Simulation, linear?: boolean): boolean {
    return true;
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 6;
  }

  getBaseDurabilityCost(simulationState: Simulation): number {
    return 10;
  }

  getBaseSuccessRate(simulationState: Simulation): number {
    return 90;
  }

  getPotency(simulation: Simulation): number {
    let potency = 100;
    if (simulation.hasBuff(this.getBuffedBy())) {
      potency += 200 * (1 - simulation.progression / simulation.recipe.progress);
    }
    if (simulation.recipe.element) {
      if (simulation.recipe.element === this.getElement()) {
        potency *= 2;
      } else {
        potency /= 2;
      }
    }
    return potency;
  }

}
