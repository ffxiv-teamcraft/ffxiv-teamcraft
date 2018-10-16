import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ListsState } from './lists.reducer';

// Lookup the 'Lists' feature state managed by NgRx
const getListsState = createFeatureSelector<ListsState>('lists');

const getMylistsLoading = createSelector(
  getListsState,
  (state: ListsState) => !state.myListsConnected
);

const getListsWithWriteAccessLoading = createSelector(
  getListsState,
  (state: ListsState) => !state.listsWithWriteAccessConnected
);

const getAllListDetails = createSelector(
  getListsState,
  (state: ListsState) => {
    return state.listDetails;
  }
);

const getAllMyLists = createSelector(
  getListsState,
  getMylistsLoading,
  (state: ListsState, loadingMyLists: boolean) => {
    return loadingMyLists ? [] : state.myLists;
  }
);

const getListsWithWriteAccess = createSelector(
  getListsState,
  getListsWithWriteAccessLoading,
  (state: ListsState, loading: boolean) => {
    return loading ? [] : state.listsWithWriteAccess;
  }
);

const getSelectedId = createSelector(
  getListsState,
  (state: ListsState) => state.selectedId
);

const getSelectedList = createSelector(
  getAllListDetails,
  getSelectedId,
  (lists, id) => {
    return lists.find(it => it.$key === id);
  }
);

export const listsQuery = {
  getMylistsLoading,
  getAllListDetails,
  getSelectedList,
  getAllMyLists,
  getListsWithWriteAccess
};
