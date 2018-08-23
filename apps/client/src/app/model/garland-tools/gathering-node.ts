export interface GatheringNode {
  zoneid: number;
  areaid: number;
  limitType: string;
  coords: number[];
  items: any[];
  time?: number[];
  uptime?: number;
  x?: number;
  y?: number;
}
