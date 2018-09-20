import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ListsState } from './lists.reducer';

// Lookup the 'Lists' feature state managed by NgRx
const getListsState = createFeatureSelector<ListsState>('lists');

const getLoading = createSelector(
  getListsState,
  (state: ListsState) => !state.loaded
);

const getAllLists = createSelector(
  getListsState,
  getLoading,
  (state: ListsState, isLoading) => {
    return isLoading ? [] : state.lists;
  }
);
const getSelectedId = createSelector(
  getListsState,
  (state: ListsState) => state.selectedId
);
const getSelectedList = createSelector(
  getAllLists,
  getSelectedId,
  (lists, id) => {
    const result = lists.find(it => it.$key === id);
    return result ? Object.assign({}, result) : undefined;
  }
);

export const listsQuery = {
  getLoading,
  getAllLists,
  getSelectedList
};
