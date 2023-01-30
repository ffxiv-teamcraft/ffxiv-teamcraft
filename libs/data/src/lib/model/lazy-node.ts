export interface LazyNode {
  base?:        number;
  duration?:    number;
  ephemeral?:   boolean;
  folklore?:    number;
  hiddenItems?: number[];
  items:        number[];
  legendary?:   boolean;
  level:        number;
  limited?:     boolean;
  map?:         number;
  spawns?:      number[];
  type:         number;
  x?:           number;
  y?:           number;
  z?:           number;
  zoneid?:      number;
}
