export interface LazyMap {
  id:               number;
  hierarchy:        number;
  priority_ui:      number;
  image:            string;
  offset_x:         number;
  offset_y:         number;
  offset_z?:        number;
  map_marker_range: number;
  placename_id:     number;
  placename_sub_id: number;
  region_id:        number;
  zone_id:          number;
  size_factor:      number;
  territory_id:     number;
  index:            number;
  dungeon:          boolean;
  housing:          boolean;
}
