export interface Ingredient {
  id: number | string;
  amount: number;
  quality?: number;
  stepid?: string;
  part?: string;
  phase?: number;
  custom?: boolean;
  batches?: number;
}
