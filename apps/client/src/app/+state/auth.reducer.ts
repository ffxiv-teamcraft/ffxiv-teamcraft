import { TeamcraftUser } from '../model/user/teamcraft-user';
import { CharacterResponse } from '@xivapi/angular-client';
import { AuthActions, AuthActionTypes } from './auth.actions';

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
  characters: CharacterResponse[];
  loading: boolean;
  linkingCharacter: boolean;
}

export const initialState: AuthState = {
  uid: null,
  user: null,
  characters: [],
  loggedIn: false,
  loading: false,
  linkingCharacter: false
};

export function authReducer(state = initialState, action: AuthActions): AuthState {
  switch (action.type) {

    case AuthActionTypes.GetUser:
      return { ...state, loading: true };

    case AuthActionTypes.UserFetched:
      return { ...state, user: action.user };

    case AuthActionTypes.LinkingCharacter:
      return { ...state, linkingCharacter: true };

    case AuthActionTypes.AddCharacter:
      return {
        ...state,
        user: { ...state.user, lodestoneIds: [...(state.user.lodestoneIds || []), { id: action.lodestoneId, verified: false}] },
        linkingCharacter: false
      };

    case AuthActionTypes.SetDefaultCharacter:
      return { ...state, user: { ...state.user, defaultLodestoneId: action.lodestoneId } };

    case AuthActionTypes.SetCurrentFcId:
      return { ...state, user: { ...state.user, currentFcId: action.fcId } };

    case AuthActionTypes.CharactersLoaded:
      return { ...state, characters: [...state.characters, ...action.characters], loading: false };

    case AuthActionTypes.Authenticated:
      return { ...state, ...action.payload, loading: true, loggedIn: true };

    case AuthActionTypes.LoggedInAsAnonymous:
      return { ...state, uid: action.uid, loggedIn: false, loading: false };

    case AuthActionTypes.GoogleLogin:
      return { ...state, loading: true };

    case AuthActionTypes.FacebookLogin:
      return { ...state, loading: true };

    case AuthActionTypes.ClassicLogin:
      return { ...state, loading: true };

    case AuthActionTypes.AuthError:
      return { ...state, ...action.payload, loading: false };

    case AuthActionTypes.Logout:
      return { ...initialState, loading: true };

    default:
      return state;
  }
}
