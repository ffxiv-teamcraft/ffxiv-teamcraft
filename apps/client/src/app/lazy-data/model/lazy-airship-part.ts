export interface LazyAirshipPart {
  id: number;
  slot: number;
  rank: number;
  components: number;
  surveillance: number | string;
  retrieval: number | string;
  speed: number | string;
  range: number | string;
  favor: number | string;
  class: number;
  repairMaterials: number;
  itemId: number;
}
