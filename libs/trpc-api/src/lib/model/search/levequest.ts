export interface Levequest {
  id: number;
  level: number;
  jobId: number;
  itemId: number;
  exp: number;
  gil: number;
  hq: boolean;
  // Amount of levequest completions
  amount: number;
  // Quantity of item required for completion
  itemQuantity: number;
  repeats: number;
  deliveryPlaceId: number;
  startPlaceId: number;
  // Levequest is selected from search results
  selected?: boolean;
  // Option to complete all deliveries (3x turn-in) is selected from search results
  allDeliveries?: boolean;
  allowanceCost: number;
}
