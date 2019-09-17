import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ListsState } from './lists.reducer';

// Lookup the 'Lists' feature state managed by NgRx
const getListsState = createFeatureSelector<ListsState>('lists');

const getCompactsLoading = createSelector(
  getListsState,
  (state: ListsState) => !state.compactsConnected
);

const getCompacts = createSelector(
  getListsState,
  getCompactsLoading,
  (state: ListsState, loading) => loading ? [] : state.compacts.filter(c => state.deleted.indexOf(c.$key) === -1)
);

const getNeedsVerification = createSelector(
  getListsState,
  (state: ListsState) => state.needsVerification
);

const getAutocompleteEnabled = createSelector(
  getListsState,
  (state: ListsState) => state.autocompletionEnabled
);

const getAllListDetails = createSelector(
  getListsState,
  (state: ListsState) => {
    return state.listDetails.filter(d => state.deleted.indexOf(d.$key) === -1);
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
  getNeedsVerification,
  getAutocompleteEnabled
};
