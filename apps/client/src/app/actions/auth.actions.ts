import { Action } from '@ngrx/store';
import { AuthState } from '../reducers/auth.reducer';
import { TeamcraftUser } from '../model/user/teamcraft-user';

export enum AuthActionTypes {
  GetUser = '[Auth] Get user',
  Authenticated = '[Auth] Authenticated',

  UserFetched = '[Auth] User fetched',

  LoginAsAnonymous = '[Auth] Login as Anonymous',
  LoggedInAsAnonymous = '[Auth] Logged in as Anonymous',

  GoogleLogin = '[Auth] Google Login attempt',
  FacebookLogin = '[Auth] Facebook Login attempt',
  ClassicLogin = '[Auth] Classic Login attempt',
  Logout = '[Auth] Logout',

  AuthError = '[Auth] Error',
}

/// Get User AuthState

export class GetUser implements Action {
  readonly type = AuthActionTypes.GetUser;

  constructor() {
  }
}

export class Authenticated implements Action {
  readonly type = AuthActionTypes.Authenticated;

  constructor(public payload: Partial<AuthState>) {
  }
}

export class UserFetched implements Action {
  readonly type = AuthActionTypes.UserFetched;

  constructor(public user: TeamcraftUser) {
  }
}

export class LoginAsAnonymous implements Action {
  readonly type = AuthActionTypes.LoginAsAnonymous;

  constructor() {
  }
}

export class LoggedInAsAnonymous implements Action {
  readonly type = AuthActionTypes.LoggedInAsAnonymous;

  constructor(public uid: string) {
  }
}

export class AuthError implements Action {
  readonly type = AuthActionTypes.AuthError;

  constructor(public payload?: any) {
  }
}

/// Login Actions

export class GoogleLogin implements Action {
  readonly type = AuthActionTypes.GoogleLogin;

  constructor(public payload?: any) {
  }
}

export class FacebookLogin implements Action {
  readonly type = AuthActionTypes.FacebookLogin;

  constructor(public payload?: any) {
  }
}

export class ClassicLogin implements Action {
  readonly type = AuthActionTypes.ClassicLogin;

  constructor(public payload?: any) {
  }
}

/// Logout Actions

export class Logout implements Action {
  readonly type = AuthActionTypes.Logout;

  constructor(public payload?: any) {
  }
}


export type AuthActions = GetUser
  | Authenticated
  | UserFetched
  | LoginAsAnonymous
  | LoggedInAsAnonymous
  | GoogleLogin
  | FacebookLogin
  | ClassicLogin
  | AuthError
  | Logout;
