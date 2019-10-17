import { ListsAction, ListsActionTypes } from './lists.actions';
import { List } from '../model/list';


export interface ListsState {
  compacts: List[];
  listDetails: List[];
  selectedId?: string; // which Lists record has been selected
  autocompletionEnabled?: boolean;
  compactsConnected: boolean;
  needsVerification: boolean;
  deleted: string[];
}

export const initialState: ListsState = {
  compacts: [],
  listDetails: [],
  compactsConnected: false,
  needsVerification: false,
  deleted: []
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

    case ListsActionTypes.MyListsLoaded: {
      state = {
        ...state,
        compacts: [
          ...state.compacts.filter(compact => compact.authorId !== action.userId || compact.offline),
          ...action.payload
        ],
        compactsConnected: true
      };
      break;
    }

    case ListsActionTypes.OfflineListsLoaded: {
      state = {
        ...state,
        listDetails: [
          ...state.listDetails.filter(list => !list.offline),
          ...action.payload
        ],
        compacts: [
          ...state.compacts.filter(compact => !compact.offline),
          ...action.payload.map(list => list.getCompact())
        ],
      };
      break;
    }

    case ListsActionTypes.TeamListsLoaded: {
      state = {
        ...state,
        compacts: [
          ...state.compacts.filter(compact => compact.teamId !== action.teamId),
          ...action.payload
        ]
      };
      break;
    }

    case ListsActionTypes.ListCompactLoaded: {
      state = {
        ...state,
        compacts: [
          ...state.compacts.filter(compact => action.payload.$key !== compact.$key),
          <List>action.payload
        ]
      };
      break;
    }

    case ListsActionTypes.SharedListsLoaded: {
      state = {
        ...state,
        compacts: [
          ...state.compacts.filter(compact => action.payload.find(c => c.$key === compact.$key) === undefined),
          ...action.payload
        ]
      };
      break;
    }

    case ListsActionTypes.ListsForTeamsLoaded: {
      state = {
        ...state,
        compacts: [
          ...state.compacts.filter(compact => action.payload.find(c => c.$key === compact.$key) === undefined),
          ...action.payload
        ]
      };
      break;
    }

    case ListsActionTypes.UpdateList: {
      state = {
        ...state,
        listDetails: [
          ...state.listDetails.map(list => list.$key === action.payload.$key ? action.payload : list)
        ]
      };
      if (action.updateCompact && state.compacts.find(l => l.$key === action.payload.$key) !== undefined) {
        state.compacts = [
          ...state.compacts.map(list => {
            if (list.$key !== action.payload.$key) {
              return list;
            }
            return action.payload.getCompact();
          })
        ];
      }
      break;
    }

    case ListsActionTypes.ListDetailsLoaded: {
      state = {
        ...state,
        listDetails: [
          ...state.listDetails.filter(list => list.$key !== action.payload.$key),
          <List>action.payload
        ]
      };
      break;
    }

    case ListsActionTypes.UnloadListDetails: {
      state = {
        ...state,
        listDetails: [
          ...state.listDetails.filter(list => list.$key !== action.key)
        ]
      };
      break;
    }

    case ListsActionTypes.UpdateListIndex: {
      state = {
        ...state,
        compacts: [
          ...state.compacts.map(list => list.$key === action.payload.$key ? action.payload : list)
        ]
      };
      break;
    }

    case ListsActionTypes.DeleteList: {
      state = {
        ...state,
        compacts: [
          ...state.compacts.filter(list => list.$key !== action.key)
        ],
        deleted: [...state.deleted, action.key]
      };
      break;
    }

    case ListsActionTypes.SelectList: {
      state = {
        ...state,
        selectedId: action.key
      };
    }
  }
  return state;
}
