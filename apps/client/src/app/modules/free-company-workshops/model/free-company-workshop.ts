import { FreeCompanyAirships } from './free-company-airships';
import { FreeCompanySubmarines } from './free-company-submarines';

export interface FreeCompanyWorkshop {
  id: string;
  name: string;
  tag: string;
  server: string;
  airships?: FreeCompanyAirships;
  submarines?: FreeCompanySubmarines;
}
