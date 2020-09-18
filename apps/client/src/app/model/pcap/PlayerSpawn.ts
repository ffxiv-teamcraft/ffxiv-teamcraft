import { BasePacket } from './BasePacket';

export interface PlayerSpawn extends BasePacket {
  title: number;
  u1b: number;
  currentWorldId: number;
  homeWorldId: number;

  gmRank: number;
  u3c: number;
  u4: number;
  onlineStatus: number;

  pose: number;
  u5a: number;
  u5b: number;
  u5c: number;

  targetId: number;
  u6: number;
  u7: number;
  mainWeaponModel: number;
  secWeaponModel: number;
  craftToolModel: number;

  u14: number;
  u15: number;
  bNPCBase: number;
  bNPCName: number;
  u18: number;
  u19: number;
  directorId: number;
  ownerId: number;
  u22: number;
  hPMax: number;
  hPCurr: number;
  displayFlags: number;
  fateID: number;
  mPCurr: number;
  mPMax: number;
  unk: number;
  modelChara: number;
  rotation: number;
  activeMinion: number;
  spawnIndex: number;
  state: number;
  persistentEmote: number;
  modelType: number;
  subtype: number;
  voice: number;
  u25c: number;
  enemyType: number;
  level: number;
  classJob : number;
  u26d: number;
  u27a: number;
  currentMount: number;
  mountHead: number;
  mountBody: number;
  mountFeet: number;
  mountColor: number;
  scale: number;

  elementData: number;

  effect: {
    effect_id: number;
    param: number;
    duration: number;
    sourceActorId: number;
  }[];
  pos: {
    x: number;
    y: number;
    z: number;
  };
  models: number[];
  name: string;
  look: number[];
  fcTag: string;
  unk30: number;
}