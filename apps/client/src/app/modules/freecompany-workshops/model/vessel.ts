export interface Vessel {
  status: number;
  name: string;
  freecompanyId: string;
  rank: number;
  currentExperience?: number;
  totalExperienceForNextRank?: number;
  capacity?: number;
  birthdate: number;
  returnTime: number;
  destinations?: number[];
}
