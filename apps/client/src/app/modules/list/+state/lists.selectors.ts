import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ListsState } from './lists.reducer';

// Lookup the 'Lists' feature state managed by NgRx
const getListsState = createFeatureSelector<ListsState>('lists');

const getListsLoading = createSelector(
  getListsState,
  (state: ListsState) => !state.listsConnected
);

const getConnectedTeams = createSelector(
  getListsState,
  (state: ListsState) => state.connectedTeams
);

const getNeedsVerification = createSelector(
  getListsState,
  (state: ListsState) => state.needsVerification
);

const getAutocompleteEnabled = createSelector(
  getListsState,
  (state: ListsState) => state.autocompletionEnabled
);

const getCompletionNotificationEnabled = createSelector(
  getListsState,
  (state: ListsState) => state.completionNotificationEnabled
);

const getAllListDetails = createSelector(
  getListsState,
  (state: ListsState) => {
    return state.listDetails.filter(d => {
      return !state.deleted.includes(d.$key)
        && (state.showArchived || !d.archived);
    });
  }
);

const getAllListDetailsWithArchived = createSelector(
  getListsState,
  (state: ListsState) => {
    return state.listDetails.filter(d => {
      return !state.deleted.includes(d.$key);
    });
  }
);

const getSelectedId = createSelector(
  getListsState,
  (state: ListsState) => state.selectedId
);

const getCurrentListHistory = createSelector(
  getListsState,
  (state: ListsState) => state.selectedListHistory
);

const getSelectedList = () => createSelector(
  getAllListDetailsWithArchived,
  getSelectedId,
  (lists, id) => {
    return lists.find(it => it.$key === id);
  }
);

const getSelectedClone = () => createSelector(
  getListsState,
  (state: ListsState) => state.selectedClone
);

const getPinnedListKey = () => createSelector(
  getListsState,
  (state) => {
    return state.pinned;
  }
);

export const listsQuery = {
  getAllListDetails,
  getSelectedList,
  getSelectedClone,
  getPinnedListKey,
  getNeedsVerification,
  getAutocompleteEnabled,
  getCompletionNotificationEnabled,
  getListsLoading,
  getConnectedTeams,
  getSelectedId,
  getCurrentListHistory
};
