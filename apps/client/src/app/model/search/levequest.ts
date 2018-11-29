import { Vector2 } from '../../core/tools/vector2';

export interface Levequest {
  level: number;
  jobId: number;
  itemId: number;
  itemIcon: string;
  recipes: { recipeId: string, jobId: number }[];
  exp: number;
  gil: number;
  // Amount of levequest completions
  amount: number;
  // Quantity of item required for completion
  itemQuantity: number;
  name: string;
  repeats: number;
  startCoordinates: Vector2;
  startMapId: number;
  startPlaceId: number;
  // Levequest is selected from search results
  selected?: boolean;
  // Option to complete all deliveries (3x turn-in) is selected from search results
  allDeliveries?: boolean;
}
