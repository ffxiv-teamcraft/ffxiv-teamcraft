import { BasePacket } from './BasePacket';

export interface ObjectSpawn extends BasePacket {
  spawnIndex: number;
  objKind: number;
  state: number;
  unknown3: number;
  objId: number;
  actorId: number;
  levelId: number;
  unknown10: number;
  someActorId14: number;
  gimmickId: number;
  scale: number;
  rotation: number;
  housingLink: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
}