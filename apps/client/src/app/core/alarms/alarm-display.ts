import { Alarm } from './alarm';
import { Aetheryte } from '../data/aetheryte';
import { NextSpawn } from './next-spawn';

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
  nextSpawn: NextSpawn;

  /**
   * Is the alarm registered in store?
   */
  registered?: boolean;

  /**
   * Is it a weather-required spawn?
   */
  weather?: number;

  /**
   * If it has groups, their names.
   */
  groupNames?: string;

  done?: boolean;

  dbType?: 'node' | 'fishing-spot' | 'spearfishing-spot';

  constructor(public readonly alarm: Alarm) {
  }
}
