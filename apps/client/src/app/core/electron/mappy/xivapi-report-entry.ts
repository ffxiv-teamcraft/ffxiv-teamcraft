export interface XivapiReportEntry {
  NodeID: number;
  BNpcNameID: number;
  BNpcBaseID: number;
  Type: 'BNPC' | 'Node';
  MapID: number;
  FateID: number;
  HP: number;
  Level: number;
  MapTerritoryID: number;
  PlaceNameID: number;
  CoordinateX: number;
  CoordinateY: number;
  CoordinateZ: number;
  PosX: number;
  PosY: number;
  PosZ: number;
  PixelX: number;
  PixelY: number;
}
