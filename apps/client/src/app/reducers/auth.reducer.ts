import { AuthActions, AuthActionTypes } from '../actions/auth.actions';
import { TeamcraftUser } from '../model/user/teamcraft-user';
import { CharacterResponse } from '@xivapi/angular-client';

export interface AuthState {
  uid: string;
  displayName: string;
  loggedIn: boolean;
  user: TeamcraftUser | null; // TODO
  characters: CharacterResponse[]; // TODO
  loading?: boolean;
  error?: string;
}

export const initialState: AuthState = {
  uid: null,
  displayName: 'Anonymous',
  user: null,
  characters: [],
  loggedIn: false
};

export function reducer(state = initialState, action: AuthActions): AuthState {
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
