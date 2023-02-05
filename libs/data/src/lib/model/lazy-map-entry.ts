export interface LazyMapEntry {
  id:          number;
  name:        string;
  scale:       number;
  territory:   number | null;
  weatherRate: number | null;
  zone:        number;
}
