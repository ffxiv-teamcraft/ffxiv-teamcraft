import { PersistedAlarm } from './persisted-alarm';
import { Aetheryte } from '../data/aetheryte';
import { NextSpawn } from './next-spawn';
import { AlarmDetails } from '@ffxiv-teamcraft/types';
import { AlarmStatus } from './alarm-status';

export class AlarmDisplay<T extends AlarmDetails | PersistedAlarm = PersistedAlarm> {

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
   * Remaining earth time before its next spawn, in seconds.
   */
  nextSpawnTime: number;

  /**
   * Status for the ingame alarm macro generator.
   */
  status: AlarmStatus;

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

  constructor(public readonly alarm: T) {
  }
}
