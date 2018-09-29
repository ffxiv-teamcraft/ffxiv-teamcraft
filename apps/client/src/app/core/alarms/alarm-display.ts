import { Alarm } from './alarm';
import { Aetheryte } from '../data/aetheryte';

export class AlarmDisplay {

  /**
   * Did the alarm ring for it?
   */
  played: boolean;

  /**
   * Is the node spawned ingame right now?
   */
  spawned: boolean;

  /**
   * Closest aetheryte to tp to.
   */
  closestAetheryte: Aetheryte;

  /**
   * Remaining earth time before it spawns, in seconds.
   */
  remainingTime: number;

  /**
   * Next spawn for the ingame alarm macro generator.
   */
  nextSpawn: number;

  /**
   * Is the alarm registered in store?
   */
  registered?: boolean;

  constructor(public readonly alarm: Alarm) {
  }
}
