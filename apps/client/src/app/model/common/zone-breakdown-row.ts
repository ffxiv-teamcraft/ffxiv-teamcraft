import { ListRow } from '../../modules/list/model/list-row';

export interface ZoneBreakdownRow {
  zoneId: number;
  mapId: number;
  items: ListRow[];
}
