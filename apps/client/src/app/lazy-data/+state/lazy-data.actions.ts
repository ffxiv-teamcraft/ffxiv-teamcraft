import { createAction, props } from '@ngrx/store';
import { LazyDataKey } from '../lazy-data-types';

export const loadLazyDataFullEntity = createAction('[LazyData] Load Full Entity', props<{ entity: LazyDataKey }>());
export const loadLazyDataEntityEntry = createAction('[LazyData] Load Entity Entry', props<{ entity: LazyDataKey, id: number }>());

export const loadLazyDataFullEntitySuccess = createAction('[LazyData] Full Entity Loaded', props<{ key: LazyDataKey, entry: Record<string, any> }>());
export const loadLazyDataEntityEntrySuccess = createAction('[LazyData] Entity Entry Loaded', props<{ key: LazyDataKey, id: number, row: any }>());
