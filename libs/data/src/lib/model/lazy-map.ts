export interface LazyMap {
  dungeon:          boolean;
  hierarchy:        number;
  housing:          boolean;
  id:               number;
  image:            string;
  index:            number;
  map_marker_range: number;
  offset_x:         number;
  offset_y:         number;
  offset_z?:        null;
  placename_id:     number;
  placename_sub_id: number;
  priority_ui:      number;
  region_id:        number;
  size_factor:      number;
  territory_id:     number;
  zone_id:          number;
}
