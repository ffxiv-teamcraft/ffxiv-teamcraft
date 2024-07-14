import { DataModel } from '../storage/data-model';

export class MappyEntry extends DataModel {
  Type: 'BNPC';

  BNpcBaseID: number;

  BNpcNameID: number;

  CoordinateX: number;

  CoordinateY: number;

  CoordinateZ: number;

  FateID: number;

  HP: number;

  Level: number;

  MapID: number;

  MapTerritoryID: number;

  NodeID?: number;

  PixelX: number;

  PixelY: number;

  PlaceNameID: number;

  PosX: number;

  PosY: number;

  PosZ: number;
}
