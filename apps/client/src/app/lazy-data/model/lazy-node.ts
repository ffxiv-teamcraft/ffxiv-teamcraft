export interface LazyNode {
  items:        number[];
  level:        number;
  type:         number;
  limited?:     boolean;
  legendary?:   boolean;
  ephemeral?:   boolean;
  spawns?:      number[];
  duration?:    number;
  zoneid?:      number | null;
  map?:         number | null;
  hiddenItems?: number[];
  x?:           number;
  y?:           number;
  z?:           number;
  folklore?:    number;
}
