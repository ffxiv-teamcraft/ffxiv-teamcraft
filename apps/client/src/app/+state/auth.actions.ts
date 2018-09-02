import { Action } from '@ngrx/store';
import { TeamcraftUser } from '../model/user/teamcraft-user';
import { AuthState } from './auth.reducer';
import { CharacterResponse } from '@xivapi/angular-client';

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

  RegistrationDone = '[Auth] Registration done',

  NoLinkedCharacter = '[Auth] No linked character',
  LinkingCharacter = '[Auth] Linking character',
  AddCharacter = '[Auth] Add character',
  SetDefaultCharacter = '[Auth] Set default character',
  CharactersLoaded = '[Auth] Characters loaded',
  UserPersisted = '[Auth] User persisted',

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
}

// Registration Actions
export class RegistrationDone implements Action {
  readonly type = AuthActionTypes.RegistrationDone;
}

// Character-related actions
export class NoLinkedCharacter implements Action {
  readonly type = AuthActionTypes.NoLinkedCharacter;
}

export class LinkingCharacter implements Action {
  readonly type = AuthActionTypes.LinkingCharacter;
}

export class AddCharacter implements Action {
  readonly type = AuthActionTypes.AddCharacter;

  constructor(public readonly lodestoneId: number, public readonly setAsDefault = false) {
  }
}

export class SetDefaultCharacter implements Action {
  readonly type = AuthActionTypes.SetDefaultCharacter;

  constructor(public readonly lodestoneId: number) {
  }
}

export class CharactersLoaded implements Action {
  readonly type = AuthActionTypes.CharactersLoaded;

  constructor(public readonly characters: CharacterResponse[]) {
  }
}

// Just an action to be sent once user is persisted properly
export class UserPersisted implements Action {
  readonly type = AuthActionTypes.UserPersisted;
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
  | Logout
  | RegistrationDone
  | LinkingCharacter
  | AddCharacter
  | SetDefaultCharacter
  | CharactersLoaded
  | UserPersisted;

export const fromAuthActions = {
  GetUser,
  Authenticated,
  UserFetched,
  LoginAsAnonymous,
  LoggedInAsAnonymous,
  GoogleLogin,
  FacebookLogin,
  ClassicLogin,
  AuthError,
  Logout,
  RegistrationDone,
  LinkingCharacter,
  AddCharacter,
  SetDefaultCharacter,
  CharactersLoaded,
  UserPersisted
};
