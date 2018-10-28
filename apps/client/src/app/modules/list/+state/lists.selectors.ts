import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ListsState } from './lists.reducer';

// Lookup the 'Lists' feature state managed by NgRx
const getListsState = createFeatureSelector<ListsState>('lists');

const getCompactsLoading = createSelector(
  getListsState,
  (state: ListsState) => !state.compactsConnected
);

const getCommunityListsLoading = createSelector(
  getListsState,
  (state: ListsState) => !state.communityListsConnected
);

const getCompacts = createSelector(
  getListsState,
  getCompactsLoading,
  (state: ListsState, loading) => loading ? [] : state.compacts
);

const getAllListDetails = createSelector(
  getListsState,
  (state: ListsState) => {
    return state.listDetails;
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
  getCompactsLoading,
  getAllListDetails,
  getSelectedList,
  getCompacts,
  getCommunityListsLoading
};
