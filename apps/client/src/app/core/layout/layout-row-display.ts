import { ListRow } from '../../model/list/list-row';

export interface LayoutRowDisplay {
  title: string;
  rows: ListRow[];
  index: number;
  zoneBreakdown: boolean;
  tiers: boolean;
  filterChain: string;
  hideIfEmpty: boolean;
}
