import { ListRow } from '../../modules/list/model/list-row';
import { LayoutRow } from './layout-row';
import { ListLayout } from './list-layout';

export interface LayoutRowDisplay {
  title: string;
  rows: ListRow[];
  index: number;
  zoneBreakdown: boolean;
  tiers: boolean;
  reverseTiers: boolean;
  filterChain: string;
  hideIfEmpty: boolean;
  collapsed: boolean;
  layoutRow: LayoutRow;
  layout: ListLayout;
}
