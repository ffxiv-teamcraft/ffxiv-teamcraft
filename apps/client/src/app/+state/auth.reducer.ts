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
  displayName: string;
  loggedIn: boolean;
  user: TeamcraftUser | null; // TODO
  characters: CharacterResponse[]; // TODO
  loading: boolean;
}

export const initialState: AuthState = {
  uid: null,
  displayName: 'Anonymous',
  user: null,
  characters: [],
  loggedIn: false,
  loading: false
};

export function authReducer(state = initialState, action: AuthActions): AuthState {
  switch (action.type) {

    case AuthActionTypes.GetUser:
      return { ...state, loading: true };

    case AuthActionTypes.Authenticated:
      return { ...state, ...action.payload, loading: false, loggedIn: true };

    case AuthActionTypes.LoggedInAsAnonymous:
      return { ...state, uid: action.uid, displayName: 'Anonymous', loggedIn: false, loading: false };

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
