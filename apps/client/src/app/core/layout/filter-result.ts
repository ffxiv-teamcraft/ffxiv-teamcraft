import { ListRow } from '../../model/list/list-row';

export interface FilterResult {
  accepted: ListRow[],
  rejected: ListRow[]
}
