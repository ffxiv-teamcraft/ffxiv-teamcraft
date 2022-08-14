import { ListsAction, ListsActionTypes } from './lists.actions';
import { List } from '../model/list';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ListController } from '../list-controller';


const PINNED_LIST_LS_KEY = 'lists:pinned';

export const listsAdapter: EntityAdapter<List> = createEntityAdapter<List>({
  selectId: list => list.$key,
  sortComparer: (a, b) => a.index - b.index
});

export interface ListsState {
  listDetails: EntityState<List>;
  selectedId?: string; // which Lists record has been selected
  autocompletionEnabled?: boolean;
  completionNotificationEnabled?: boolean;
  listsConnected: boolean;
  needsVerification: boolean;
  connectedTeams: string[];
  deleted: string[];
  pinned: string;
  showArchived: boolean;
  readLock: boolean;
}

export const initialState: ListsState = {
  listDetails: listsAdapter.getInitialState(),
  listsConnected: false,
  needsVerification: false,
  deleted: [],
  connectedTeams: [],
  pinned: localStorage.getItem(PINNED_LIST_LS_KEY) || 'none',
  showArchived: false,
  readLock: false
};

function updateLists(lists: List[], state: ListsState, matchingPredicate = (list: List) => false): ListsState {
  const listsByKey = lists.reduce((acc, list) => ({ ...acc, [list.$key]: list }), {});
  const checkedLists = {};
  const toDelete = [];
  const afterMap = listsAdapter.map(storeList => {
    checkedLists[storeList.$key] = true;
    const patch = listsByKey[storeList.$key];
    if (patch && patch.etag >= storeList.etag) {
      if (storeList.$key === state.selectedId && state.readLock) {
        return storeList;
      }
      return patch;
    }
    if (!patch && matchingPredicate(storeList)) {
      toDelete.push(storeList.$key);
    }
    return storeList;
  }, state.listDetails);
  const afterSet = lists.filter(list => !checkedLists[list.$key])
    .reduce((acc, list) => {
      return listsAdapter.setOne(list, acc);
    }, afterMap);
  return {
    ...state,
    listDetails: listsAdapter.removeMany(toDelete, afterSet)
  };
}

export function listsReducer(
  state: ListsState = initialState,
  action: ListsAction
): ListsState {
  switch (action.type) {

    case ListsActionTypes.NeedsVerification: {
      state = {
        ...state,
        needsVerification: action.verificationNeeded
      };
      break;
    }

    case ListsActionTypes.ToggleAutocompletion: {
      state = {
        ...state,
        autocompletionEnabled: action.enabled
      };
      break;
    }

    case ListsActionTypes.ToggleCompletionNotification: {
      state = {
        ...state,
        completionNotificationEnabled: action.enabled
      };
      break;
    }

    case ListsActionTypes.SetItemDone: {
      const list = ListController.clone(state.listDetails.entities[state.selectedId], true);
      const item = ListController.getItemById(list, action.itemId, !action.finalItem, action.finalItem);
      const requiredHq = ListController.requiredAsHQ(list, item) > 0;
      let fill = true;
      if (state.autocompletionEnabled && action.settings.enableAutofillHQFilter && requiredHq) {
        fill = !action.fromPacket || action.hq;
      }
      if (state.autocompletionEnabled && action.settings.enableAutofillNQFilter && !requiredHq) {
        fill = !action.fromPacket || !action.hq;
      }
      if (fill) {
        ListController.setDone(list, action.itemId, action.doneDelta, !action.finalItem, action.finalItem, false, action.recipeId, action.external);
        ListController.updateAllStatuses(list, action.itemId);
        state = {
          ...state,
          readLock: true,
          listDetails: listsAdapter.setOne(list, state.listDetails)
        };
      }
      break;
    }

    case ListsActionTypes.RemoveReadLock: {
      state = {
        ...state,
        readLock: false
      };
      break;
    }

    case ListsActionTypes.MyListsLoaded: {
      state = {
        ...updateLists(action.payload, state, list => {
          return list.authorId === action.userId
            && !list.offline
            && !list.archived;
        }),
        listsConnected: true
      };
      break;
    }

    case ListsActionTypes.LoadArchivedLists: {
      state = {
        ...state,
        showArchived: true
      };
      break;
    }

    case ListsActionTypes.UnLoadArchivedLists: {
      state = {
        ...state,
        showArchived: false
      };
      break;
    }

    case ListsActionTypes.ArchivedListsLoaded: {
      state = updateLists(action.payload, state, list => {
        return list.authorId === action.userId && list.archived;
      });
      break;
    }

    case ListsActionTypes.OfflineListsLoaded: {
      state = updateLists(action.payload, state, list => {
        return list.offline;
      });
      break;
    }

    case ListsActionTypes.TeamListsLoaded: {
      state = {
        ...updateLists(action.payload, state, list => {
          return list.teamId === action.teamId;
        }),
        connectedTeams: [
          ...state.connectedTeams,
          action.teamId
        ]
      };
      break;
    }

    case ListsActionTypes.SharedListsLoaded: {
      state = updateLists(action.payload, state);
      break;
    }

    case ListsActionTypes.ListsForTeamsLoaded: {
      state = updateLists(action.payload, state);
      break;
    }

    case ListsActionTypes.ListDetailsLoaded: {
      const newVersion = action.payload as List;
      let updated = false;
      let listDetails = state.listDetails;
      if (state.listDetails.entities[action.payload.$key]) {
        listDetails = listsAdapter.mapOne({
          id: action.payload.$key,
          map: current => {
            updated = (newVersion.etag || 0) >= (current.etag || 0);
            if (updated) {
              return newVersion;
            }
            return current;
          }
        }, state.listDetails);
      } else {
        listDetails = listsAdapter.setOne(action.payload as List, state.listDetails);
        updated = true;
      }
      state = {
        ...state,
        listDetails
      };
      break;
    }

    case ListsActionTypes.PureUpdateList: {
      state = {
        ...state,
        listDetails: listsAdapter.mapOne({
          id: action.$key,
          map: current => Object.assign(current, action.payload)
        }, state.listDetails)
      };
      break;
    }

    case ListsActionTypes.DeleteList: {
      state = {
        ...state,
        listDetails: listsAdapter.removeOne(action.key, state.listDetails),
        deleted: [...state.deleted, action.key]
      };
      break;
    }

    case ListsActionTypes.SelectList: {
      state = {
        ...state,
        selectedId: action.key
      };
      break;
    }

    case ListsActionTypes.PinList: {
      state = {
        ...state,
        pinned: action.uid
      };
      localStorage.setItem(PINNED_LIST_LS_KEY, action.uid);
      break;
    }

    case ListsActionTypes.UnPinList: {
      state = {
        ...state,
        pinned: 'none'
      };
      localStorage.setItem(PINNED_LIST_LS_KEY, 'none');
      break;
    }
  }
  return state;
}
