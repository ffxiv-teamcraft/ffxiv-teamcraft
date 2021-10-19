import { Aetheryte } from '../../core/data/aetheryte';

export interface MapData {
  id: number;
  zone_id: number;
  size_factor: number;
  offset_x: number;
  offset_y: number;
  offset_z?: number;
  map_marker_range: number;
  priority_ui: number;
  hierarchy: number;
  territory_id: number;
  image: string;
  placename_id: number;
  placename_sub_id: number;
  region_id: number;
  aetherytes?: Aetheryte[];
}
