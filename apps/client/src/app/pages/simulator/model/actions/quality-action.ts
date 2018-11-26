import { Simulation } from '../../simulation/simulation';
import { GeneralAction } from './general-action';
import { Buff } from '../buff.enum';
import { ActionType } from './action-type';

export abstract class QualityAction extends GeneralAction {

  public getType(): ActionType {
    return ActionType.QUALITY;
  }

  execute(simulation: Simulation, skipStackAddition = false): void {
    let qualityIncrease = Math.floor(this.getBaseQuality(simulation) * this.getPotency(simulation) / 100);
    switch (simulation.state) {
      case 'EXCELLENT':
        qualityIncrease *= 4;
        break;
      case 'POOR':
        qualityIncrease *= 0.5;
        break;
      case 'GOOD':
        qualityIncrease *= 1.5;
        break;
      default:
        break;
    }
    if (simulation.hasBuff(Buff.GREAT_STRIDES)) {
      qualityIncrease *= 2;
      simulation.removeBuff(Buff.GREAT_STRIDES);
    }
    simulation.quality += Math.ceil(qualityIncrease);
    if (simulation.hasBuff(Buff.INNER_QUIET) && simulation.getBuff(Buff.INNER_QUIET).stacks < 11 && !skipStackAddition) {
      simulation.getBuff(Buff.INNER_QUIET).stacks++;
    }
  }

}
