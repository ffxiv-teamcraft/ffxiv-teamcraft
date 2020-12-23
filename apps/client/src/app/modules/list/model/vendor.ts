export interface Vendor {
  npcId: number;
  zoneId?: number;
  mapId?: number;
  areaId?: number;
  price: number;
  coords?: { x: number; y: number; };
  festival?: number;
}
