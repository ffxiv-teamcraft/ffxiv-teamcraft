import { BuffAction } from '../buff-action';
import { Simulation } from '../../../simulation/simulation';
import { Buff } from '../../buff.enum';

export abstract class NameOfBuff extends BuffAction {

  _canBeUsed(simulation: Simulation): boolean {
    return !simulation.hasBuff(Buff.NAME_OF_FIRE)
      && !simulation.hasBuff(Buff.NAME_OF_LIGHTNING)
      && !simulation.hasBuff(Buff.NAME_OF_WATER)
      && !simulation.hasBuff(Buff.NAME_OF_EARTH)
      && !simulation.hasBuff(Buff.NAME_OF_ICE)
      && !simulation.hasBuff(Buff.NAME_OF_THE_WIND);
  }

  getBaseCPCost(simulationState: Simulation): number {
    return 15;
  }

  getDuration(simulation: Simulation): number {
    return 5;
  }

  protected getInitialStacks(): number {
    return 0;
  }

  protected getTick(): (simulation: Simulation, linear?: boolean) => void {
    return undefined;
  }
}
