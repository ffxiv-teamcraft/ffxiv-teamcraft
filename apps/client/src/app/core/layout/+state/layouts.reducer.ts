import { deleteListLayout, loadListLayoutsSuccess, loadListLayoutSuccess, selectListLayout, updateListLayout } from './layouts.actions';
import { ListLayout } from '../list-layout';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

export const LIST_LAYOUTS_FEATURE_KEY = 'layouts';

/**
 * Interface for the 'Layouts' data used in
 *  - LayoutsState, and
 *  - layoutsReducer
 *
 *  Note: replace if already defined in another module
 */

export interface LayoutsState extends EntityState<ListLayout> {
  selectedId?: string; // which Layouts record has been selected
  loaded: boolean; // has the Layouts list been loaded
}

export interface ListLayoutsPartialState {
  readonly [LIST_LAYOUTS_FEATURE_KEY]: LayoutsState;
}

export const listLayoutsAdapter = createEntityAdapter<ListLayout>({
  selectId: layout => layout.$key
});

export const initialState: LayoutsState = listLayoutsAdapter.getInitialState({
  selectedId: localStorage.getItem('layout:selected') || undefined,
  loaded: false
});

export const layoutsReducer = createReducer(
  initialState,
  on(loadListLayoutsSuccess, (state, { layouts }) =>
    listLayoutsAdapter.addMany(layouts, {
      ...state,
      loaded: true
    })
  ),
  on(loadListLayoutSuccess, (state, { layout }) =>
    listLayoutsAdapter.addOne(layout, {
      ...state
    })
  ),
  on(selectListLayout, (state, { key }) =>
    ({
      ...state,
      selectedId: key
    })
  ),
  on(updateListLayout, (state, { layout }) =>
    listLayoutsAdapter.setOne(layout, {
      ...state
    })
  ),
  on(deleteListLayout, (state, { id }) =>
    listLayoutsAdapter.removeOne(id, {
      ...state
    })
  )
);
