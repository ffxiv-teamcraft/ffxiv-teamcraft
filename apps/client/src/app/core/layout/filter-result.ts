import { ListRow } from '../../modules/list/model/list-row';

export interface FilterResult {
  accepted: ListRow[],
  rejected: ListRow[]
}
