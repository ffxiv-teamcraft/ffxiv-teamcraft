import { LazyData } from '../core/data/lazy-data';
import { ListRow } from '../modules/list/model/list-row';

export type LazyDataKey = keyof LazyData | 'extracts';

export type LazyDataWithExtracts = { [Property in keyof LazyData]: LazyData[Property] } & { extracts: Record<number, ListRow> };
