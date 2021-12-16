export class GtLeve {
  name: string;

  location: string;

  id: number;

  patch: number;

  sort: number;

  icon: number;

  eventIcon: number;

  issuer: number;

  target: number;

  involved: number[];

  genre: number;

  journal: string[];

  objectives: string[];

  dialogue: { name: string, text: string }[];

  reward: {
    xp: number;
    gil: number;
    instance: number;
    reputation?: number;
  };

  reqs: any;

  next: number[];

  talk: {
    name: string;
    lines: string[];
    npcid: number;
  };
}
