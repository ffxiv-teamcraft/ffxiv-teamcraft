import { BasePacket } from './BasePacket';

export interface UpdateClassInfo extends BasePacket {
  classId: number;
  level1: number;
  level: number;
  nextLevelIndex: number;
  currentExp: number;
  restedExp: number;
}