import { createAction, props } from '@ngrx/store';
import { LazyData } from '../../core/data/lazy-data';

export const loadLazyDataFullEntity = createAction('[LazyData] Load Full Entity', props<{entity: keyof LazyData | 'extracts'}>());
export const loadLazyDataEntityEntry = createAction('[LazyData] Load Entity Entry', props<{entity: keyof LazyData | 'extracts', id:number}>());

export const lazyDataFullEntityLoading = createAction('[LazyData] Full Entity Loading', props<{entity: keyof LazyData | 'extracts'}>());
export const lazyDataEntityEntryLoading = createAction('[LazyData] Entity Entry Loading', props<{entity: keyof LazyData | 'extracts', id:number}>());

export const loadLazyDataFullEntitySuccess = createAction('[LazyData] Full Entity Loaded', props<{key: keyof LazyData | 'extracts', entry: Record<string, any>}>());
export const loadLazyDataEntityEntrySuccess = createAction('[LazyData] Entity Entry Loaded', props<{key: keyof LazyData | 'extracts', id:number, row: Object}>());
