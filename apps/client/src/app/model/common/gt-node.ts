export interface GtNode {
  type: string;
  func: string;
  items: {
    item: string;
    icon: number;
    id: number;
    slot: string
  }[];
  stars: number,
  time: number[],
  title: string;
  zone: string;
  coords: [
    number,
    number
  ],
  name: string;
  uptime: number;
  lvl: number;
  id: number;
  patch: number;
}
