import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ListsState } from './lists.reducer';

// Lookup the 'Lists' feature state managed by NgRx
const getListsState = createFeatureSelector<ListsState>('lists');

const getLoaded = createSelector(
  getListsState,
  (state: ListsState) => state.loaded
);
const getError = createSelector(
  getListsState,
  (state: ListsState) => state.error
);

const getAllLists = createSelector(
  getListsState,
  getLoaded,
  (state: ListsState, isLoaded) => {
    return isLoaded ? state.list : [];
  }
);
const getSelectedId = createSelector(
  getListsState,
  (state: ListsState) => state.selectedId
);
const getSelectedLists = createSelector(
  getAllLists,
  getSelectedId,
  (lists, id) => {
    const result = lists.find(it => it['id'] === id);
    return result ? Object.assign({}, result) : undefined;
  }
);

export const listsQuery = {
  getLoaded,
  getError,
  getAllLists,
  getSelectedLists
};
