import { BasePacket } from './BasePacket';

export interface EffectResult extends BasePacket {
  globalSequence: number;
	actorID: number;
	currentHp: number;
	maxHp: number;
	currentMp: number;
	unknown1: number;
	classId: number;
	shieldPercentage: number;
	entryCount: number;
	unknown2: number;
	statusEntries: {
    index: number;
    unknown3: number;
    id: number;
    param: number;
    duration: number;
    sourceActorID: number;
  }[];
}