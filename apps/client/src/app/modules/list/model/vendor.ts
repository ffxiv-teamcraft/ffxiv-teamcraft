export interface Vendor {
  npcId: number;
  zoneId?: number;
  areaId?: number;
  price: number;
  coords?: { x: number; y: number; };
}
