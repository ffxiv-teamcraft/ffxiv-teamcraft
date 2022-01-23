import { TeamcraftUser } from '../model/user/teamcraft-user';
import { AuthActions, AuthActionTypes } from './auth.actions';
import { CommissionProfile } from '../model/user/commission-profile';
import { LogTracking } from '../model/user/log-tracking';

/**
 * Interface for the 'Auth' data used in
 *  - AuthState, and
 *  - authReducer
 *
 *  Note: replace if already defined in another module
 */

/* tslint:disable:no-empty-interface */
export interface AuthState {
  uid: string;
  loggedIn: boolean;
  user: TeamcraftUser | null;
  loading: boolean;
  linkingCharacter: boolean;
  commissionProfile: CommissionProfile;
  logTracking: LogTracking;
  serverLogTracking?: LogTracking;
}

export const initialState: AuthState = {
  uid: null,
  user: null,
  loggedIn: false,
  loading: false,
  linkingCharacter: false,
  commissionProfile: null,
  logTracking: null
};

export function authReducer(state = initialState, action: AuthActions): AuthState {
  switch (action.type) {

    case AuthActionTypes.GetUser:
      return { ...state, loading: true };

    case AuthActionTypes.UserFetched:
      return { ...state, user: action.user, loading: false };

    case AuthActionTypes.LinkingCharacter:
      return { ...state, linkingCharacter: true };

    case AuthActionTypes.ToggleFavorite: {
      if (state.user.favorites[action.dataType] === undefined) {
        state.user.favorites[action.dataType] = [];
      }
      if (state.user.favorites[action.dataType].indexOf(action.key) > -1) {
        state.user.favorites[action.dataType] = state.user.favorites[action.dataType].filter(fav => fav !== action.key);
      } else {
        state.user.favorites[action.dataType].push(action.key);
      }
      const newFavorites = { ...state.user.favorites };
      return {
        ...state,
        user: {
          ...state.user,
          favorites: newFavorites
        }
      };
    }

    case AuthActionTypes.ToggleMasterbooks: {
      const books = action.books;
      const lodestoneId = state.user.lodestoneIds.find(entry => entry.id === state.user.defaultLodestoneId);
      let masterbooks = (lodestoneId.masterbooks || []);
      books.forEach(book => {
        if (book.checked && masterbooks.indexOf(book.id) === -1) {
          masterbooks.push(book.id);
        } else if (!book.checked && masterbooks.indexOf(book.id) > -1) {
          masterbooks = masterbooks.filter(b => b !== book.id);
        }
      });
      lodestoneId.masterbooks = masterbooks;
      return {
        ...state,
        user: {
          ...state.user,
          lodestoneIds: [
            ...state.user.lodestoneIds.filter(entry => {
              return entry.id !== lodestoneId.id;
            }),
            lodestoneId
          ]
        }
      };
    }

    case AuthActionTypes.SaveSet: {
      const lodestoneId = state.user.lodestoneIds
        .filter(id => id !== undefined)
        .find(entry => entry.id === state.user.defaultLodestoneId) || state.user.lodestoneIds[0];
      if (lodestoneId === undefined) {
        return;
      }
      const oldSet = (lodestoneId.stats || []).find(set => set.jobId === action.set.jobId);
      if (oldSet !== undefined && action.ignoreSpecialist) {
        action.set.specialist = oldSet.specialist;
      }
      lodestoneId.stats = [
        ...(lodestoneId.stats || []).filter(set => set.jobId !== action.set.jobId),
        action.set
      ];
      return {
        ...state,
        user: {
          ...state.user,
          lodestoneIds: [
            ...state.user.lodestoneIds.filter(entry => {
              return entry.id !== lodestoneId.id;
            }),
            lodestoneId
          ]
        }
      };
    }

    case AuthActionTypes.UpdateUser: {
      return {
        ...state,
        user: {
          ...action.user
        }
      };
    }

    case AuthActionTypes.SetCID: {
      return {
        ...state,
        user: {
          ...state.user,
          cid: action.cid
        }
      };
    }

    case AuthActionTypes.SetWorld: {
      return {
        ...state,
        user: {
          ...state.user,
          world: action.worldId
        }
      };
    }

    case AuthActionTypes.SaveDefaultConsumables: {
      return {
        ...state,
        user: {
          ...state.user,
          defaultConsumables: action.consumables
        }
      };
    }

    case AuthActionTypes.VerifyCharacter: {
      return {
        ...state,
        user: {
          ...state.user,
          lodestoneIds: [
            ...state.user.lodestoneIds.map(entry => {
              if (entry.id === action.lodestoneId) {
                return {
                  ...entry,
                  verified: true
                };
              }
              return entry;
            })
          ]
        }
      };
    }

    case AuthActionTypes.SetContentId: {
      return {
        ...state,
        user: {
          ...state.user,
          lodestoneIds: state.user.lodestoneIds.map(entry => {
            if (entry.id === action.characterId) {
              return {
                ...entry,
                contentId: action.contentId
              };
            }
            return entry;
          })
        }
      };
    }

    case AuthActionTypes.AddCharacter: {
      if (state.user.lodestoneIds && state.user.lodestoneIds.find(l => l.id === action.lodestoneId) !== undefined) {
        return state;
      }

      return {
        ...state,
        user: {
          ...state.user,
          lodestoneIds: [...(state.user.lodestoneIds || []), { id: action.lodestoneId, verified: false }]
        },
        linkingCharacter: false
      };
    }

    case AuthActionTypes.RemoveCharacter: {
      return {
        ...state,
        user: {
          ...state.user,
          lodestoneIds: [...(state.user.lodestoneIds || []).filter(entry => entry.id !== action.lodestoneId)],
          defaultLodestoneId: state.user.lodestoneIds[0].id
        },
        linkingCharacter: false
      };
    }

    case AuthActionTypes.AddCustomCharacter: {
      if (state.user.customCharacters && state.user.customCharacters.find(c => c.ID === action.lodestoneId) !== undefined) {
        return state;
      }

      return {
        ...state,
        user: { ...state.user, customCharacters: [...(state.user.customCharacters || []), action.character] }
      };
    }

    case AuthActionTypes.SetDefaultCharacter:
      return { ...state, user: { ...state.user, defaultLodestoneId: action.lodestoneId } };

    case AuthActionTypes.SetCurrentFcId:
      return { ...state, user: { ...state.user, currentFcId: action.fcId } };

    case AuthActionTypes.Authenticated:
      return { ...state, ...action.payload, loading: true, loggedIn: true };

    case AuthActionTypes.LoggedInAsAnonymous:
      return { ...state, uid: action.uid, loggedIn: false, loading: false };

    case AuthActionTypes.GoogleLogin:
      return { ...state, loading: true };

    case AuthActionTypes.ClassicLogin:
      return { ...state, loading: true };

    case AuthActionTypes.AuthError:
      return { ...state, ...action.payload, loading: false };

    case AuthActionTypes.Logout:
      return { ...initialState, loading: true };

    case AuthActionTypes.CommissionProfileLoaded:
      return {
        ...state,
        commissionProfile: action.payload
      };

    case AuthActionTypes.LogTrackingLoaded:
      return {
        ...state,
        logTracking: action.payload,
        serverLogTracking: action.payload
      };

    case AuthActionTypes.MarkAsDoneInLog:
      return {
        ...state,
        logTracking: {
          ...state.logTracking,
          [action.log]: [
            ...(state.logTracking[action.log] || []),
            action.itemId
          ]
        }
      };

    default:
      return state;
  }
}
