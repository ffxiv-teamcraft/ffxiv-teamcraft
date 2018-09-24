import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ListsState } from './lists.reducer';

// Lookup the 'Lists' feature state managed by NgRx
const getListsState = createFeatureSelector<ListsState>('lists');

const getMylistsLoading = createSelector(
  getListsState,
  (state: ListsState) => !state.myListsConnected
);

const getAllLists = createSelector(
  getListsState,
  (state: ListsState) => {
    return state.lists;
  }
);

const getAllMyLists = createSelector(
  getListsState,
  getMylistsLoading,
  (state: ListsState, loadingMyLists: boolean) => {
    return loadingMyLists ? [] : state.lists;
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
  getMylistsLoading,
  getAllLists,
  getSelectedList,
  getAllMyLists
};
