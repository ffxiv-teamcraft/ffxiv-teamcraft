import { ListsAction, ListsActionTypes } from './lists.actions';
import { List } from '../model/list';
import { ListController } from '../list-controller';
import { ModificationEntry } from '../model/modification-entry';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';


const PINNED_LIST_LS_KEY = 'lists:pinned';

export const listsAdapter: EntityAdapter<List> = createEntityAdapter<List>({
  selectId: list => list.$key,
  sortComparer: (a, b) => a.index - b.index
});

export interface ListsState {
  listDetails: EntityState<List>;
  selectedId?: string; // which Lists record has been selected
  selectedClone?: List; // a clone of the currently selected list for diff updates
  autocompletionEnabled?: boolean;
  completionNotificationEnabled?: boolean;
  listsConnected: boolean;
  needsVerification: boolean;
  connectedTeams: string[];
  deleted: string[];
  pinned: string;
  showArchived: boolean;
  listHistories: Record<string, ModificationEntry[]>;
}

export const initialState: ListsState = {
  listDetails: listsAdapter.getInitialState(),
  listsConnected: false,
  needsVerification: false,
  deleted: [],
  connectedTeams: [],
  pinned: localStorage.getItem(PINNED_LIST_LS_KEY) || 'none',
  showArchived: false,
  listHistories: {}
};

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

    case ListsActionTypes.MyListsLoaded: {
      state = {
        ...state,
        listDetails: listsAdapter.setMany(action.payload.filter(list => list.$key !== state.selectedId),
          listsAdapter.removeMany(list => {
            return list.$key !== state.selectedId &&
              list.authorId === action.userId
              && !list.offline
              && !list.archived;
          }, state.listDetails)
        ),
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
      state = {
        ...state,
        listDetails: listsAdapter.setMany(action.payload.filter(list => list.$key !== state.selectedId),
          listsAdapter.removeMany(list => {
            return list.$key !== state.selectedId &&
              list.authorId === action.userId && list.archived;
          }, state.listDetails)
        )
      };
      break;
    }

    case ListsActionTypes.OfflineListsLoaded: {
      state = {
        ...state,
        listDetails: listsAdapter.setMany(action.payload.filter(list => list.$key !== state.selectedId),
          listsAdapter.removeMany(list => {
            return list.$key !== state.selectedId &&
              list.offline;
          }, state.listDetails)
        )
      };
      break;
    }

    case ListsActionTypes.LoadTeamLists: {
      state = {
        ...state
      };
      break;
    }

    case ListsActionTypes.TeamListsLoaded: {
      state = {
        ...state,
        listDetails: listsAdapter.setMany(action.payload.filter(list => list.$key !== state.selectedId),
          listsAdapter.removeMany(list => {
            return list.$key !== state.selectedId &&
              list.teamId === action.teamId;
          }, state.listDetails)
        ),
        connectedTeams: [
          ...state.connectedTeams,
          action.teamId
        ]
      };
      break;
    }

    case ListsActionTypes.SharedListsLoaded: {
      state = {
        ...state,
        listDetails: listsAdapter.setMany(action.payload.filter(list => list.$key !== state.selectedId), state.listDetails)
      };
      break;
    }

    case ListsActionTypes.ListsForTeamsLoaded: {
      state = {
        ...state,
        listDetails: listsAdapter.setMany(action.payload.filter(list => list.$key !== state.selectedId), state.listDetails)
      };
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
            updated = newVersion.etag > current.etag;
            if (newVersion.etag > current.etag) {
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
      if (updated && state.selectedId === action.payload.$key && !action.payload.notFound) {
        state.selectedClone = ListController.clone(action.payload as List, true);
      }
      break;
    }

    case ListsActionTypes.UpdateSelectedClone: {
      state = {
        ...state,
        selectedClone: action.payload
      };
      break;
    }

    case ListsActionTypes.ListHistoryLoaded: {
      state = {
        ...state,
        listHistories: {
          ...state.listHistories,
          [action.listId]: action.history
        }
      };
      break;
    }

    case ListsActionTypes.UnloadListDetails: {
      state = {
        ...state,
        listHistories: {
          ...state.listHistories,
          [action.key]: null
        }
      };
      break;
    }

    case ListsActionTypes.UpdateListProgress: {
      state = {
        ...state,
        listDetails: listsAdapter.setOne(action.payload, state.listDetails)
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
      const selected = state.listDetails.entities[action.key];
      state = {
        ...state,
        selectedId: action.key,
        selectedClone: selected ? ListController.clone(selected, true) : null
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
