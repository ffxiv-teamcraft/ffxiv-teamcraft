export interface LazyDiademTerritory {
  index:     number;
  subIndex:  number;
  __sheet:   string;
  PlaceName: number;
  Map:       Map;
}

export interface Map {
  index:      number;
  subIndex:   number;
  __sheet:    string;
  SizeFactor: number;
}
