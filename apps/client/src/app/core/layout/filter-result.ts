import { ListRow } from '../list/model/list-row';

export interface FilterResult {
  accepted: ListRow[],
  rejected: ListRow[]
}
