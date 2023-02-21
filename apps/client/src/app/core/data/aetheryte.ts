import { Vector2, Vector3 } from "@ffxiv-teamcraft/types";


export interface Aetheryte extends Vector3 {
  id: number;
  zoneid: number;
  map: number;
  type: number;
  nameid: number;
  aethernetCoords?: Vector2;
}
