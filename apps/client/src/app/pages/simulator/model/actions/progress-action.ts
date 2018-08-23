import { Simulation } from '../../simulation/simulation';
import { GeneralAction } from './general-action';
import { ActionType } from './action-type';
import { Buff } from '../buff.enum';

export abstract class ProgressAction extends GeneralAction {

  public getType(): ActionType {
    return ActionType.PROGRESSION;
  }

  execute(simulation: Simulation): void {
    let potency = this.getPotency(simulation);
    // If we have WwyW running and its stacks are %3, add 50 potency.
    // Source: https://www.reddit.com/r/ffxiv/comments/3bwr7n/crafting_specialist_actions_thoughts_and_findings/
    if (simulation.hasBuff(Buff.WHISTLE_WHILE_YOU_WORK) && simulation.getBuff(Buff.WHISTLE_WHILE_YOU_WORK).stacks > 0
      && simulation.getBuff(Buff.WHISTLE_WHILE_YOU_WORK).stacks % 3 === 0) {
      potency += 50;
    }
    simulation.progression += Math.floor(this.getBaseProgression(simulation) * potency / 100);
  }
}
