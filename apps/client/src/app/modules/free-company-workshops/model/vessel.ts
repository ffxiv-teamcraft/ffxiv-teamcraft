import { VesselType } from './vessel-type';

export interface Vessel {
  vesselType: VesselType;
  status: number;
  name: string;
  freeCompanyId: string;
  rank: number;
  currentExperience?: number;
  totalExperienceForNextRank?: number;
  capacity?: number;
  birthdate: number;
  returnTime: number;
  destinations?: number[];
}
