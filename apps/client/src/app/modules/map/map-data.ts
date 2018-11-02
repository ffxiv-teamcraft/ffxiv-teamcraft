import { Aetheryte } from '../../core/data/aetheryte';

export interface MapData {
  id: number;
  zone_id: number;
  size_factor: number;
  offset_x: number;
  offset_y: number;
  map_marker_range: number;
  hierarchy: number;
  territory_id: number;
  image: string;
  placename_id: number;
  region_id: number;
  aetherytes: Aetheryte[];
}
