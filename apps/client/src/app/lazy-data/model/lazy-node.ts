export interface LazyNode {
  items:        number[];
  level:        number;
  type:         number;
  limited?:     boolean;
  base?:        number;
  legendary?:   boolean;
  ephemeral?:   boolean;
  spawns?:      number[];
  duration?:    number;
  zoneid?:      number;
  x?:           number;
  y?:           number;
  z?:           number;
  map?:         number;
  hiddenItems?: number[];
  folklore?:    number;
}
