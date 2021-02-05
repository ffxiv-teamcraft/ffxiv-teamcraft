import { FreecompanyAirships } from './freecompany-airships';
import { FreecompanySubmarines } from './freecompany-submarines';

export class FreecompanyWorkshop {
  id: string;
  name: string;
  tag: string;
  world: string;
  airships?: FreecompanyAirships;
  submarines?: FreecompanySubmarines;
}
