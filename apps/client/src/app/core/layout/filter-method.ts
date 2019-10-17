import { ListRow } from '../../modules/list/model/list-row';
import { List } from '../../modules/list/model/list';

export type FilterMethod = (row: ListRow, list: List) => boolean;
