import { ListRow } from '../../modules/list/model/list-row';

export interface LayoutRowDisplay {
  title: string;
  rows: ListRow[];
  index: number;
  zoneBreakdown: boolean;
  tiers: boolean;
  filterChain: string;
  hideIfEmpty: boolean;
  collapsed: boolean;
}
