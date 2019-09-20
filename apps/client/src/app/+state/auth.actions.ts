import { Action } from '@ngrx/store';
import { TeamcraftUser } from '../model/user/teamcraft-user';
import { AuthState } from './auth.reducer';
import { Character, CharacterResponse } from '@xivapi/angular-client';
import { DefaultConsumables } from '../model/user/default-consumables';
import { Favorites } from '../model/other/favorites';
import { GearSet } from '@ffxiv-teamcraft/simulator';

export enum AuthActionTypes {
  GetUser = '[Auth] Get user',
  Authenticated = '[Auth] Authenticated',

  UserFetched = '[Auth] User fetched',
  UpdateUser = '[Auth] Update User',
  RegisterUser = '[Auth] Register User',

  LoginAsAnonymous = '[Auth] Login as Anonymous',
  LoggedInAsAnonymous = '[Auth] Logged in as Anonymous',

  ToggleFavorite = '[Auth] Toggle Favorite',

  GoogleLogin = '[Auth] Google Login attempt',
  FacebookLogin = '[Auth] Facebook Login attempt',
  ClassicLogin = '[Auth] Classic Login attempt',
  Logout = '[Auth] Logout',

  RegistrationDone = '[Auth] Registration done',

  NoLinkedCharacter = '[Auth] No linked character',
  LinkingCharacter = '[Auth] Linking character',
  AddCharacter = '[Auth] Add character',
  AddCustomCharacter = '[Auth] Add custom character',
  VerifyCharacter = '[Auth] Verify character',
  RemoveCharacter = '[Auth] Remove character',
  SetDefaultCharacter = '[Auth] Set default character',
  SetCurrentFcId = '[Auth] Set Current fc id',
  CharactersLoaded = '[Auth] Characters loaded',
  UserPersisted = '[Auth] User persisted',
  SetCID = '[Auth] Set CID',
  SetWorld = '[Auth] Set World',

  ToggleMasterbooks = '[Auth] Toggle Masterbooks',
  SaveSet = '[Auth] Save set',
  SaveDefaultConsumables = '[Auth] Save default consumables',

  AnonymousWarningShown = '[Auth] Anonyous warning shown',

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

  constructor(public payload: Partial<AuthState>, public uid: string, public createdAt?: Date) {
  }
}

export class ToggleFavorite implements Action {
  readonly type = AuthActionTypes.ToggleFavorite;

  constructor(public dataType: keyof Favorites, public key: string) {
  }
}

export class UserFetched implements Action {
  readonly type = AuthActionTypes.UserFetched;

  constructor(public user: TeamcraftUser) {
  }
}

export class UpdateUser implements Action {
  readonly type = AuthActionTypes.UpdateUser;

  constructor(public user: TeamcraftUser) {
  }
}

export class SetCID implements Action {
  readonly type = AuthActionTypes.SetCID;

  constructor(public cid: string) {
  }
}

export class SetWorld implements Action {
  readonly type = AuthActionTypes.SetWorld;

  constructor(public worldId: number) {
  }
}

export class RegisterUser implements Action {
  readonly type = AuthActionTypes.RegisterUser;

  constructor(public uid: string, public user: TeamcraftUser) {
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

export class AddCustomCharacter implements Action {
  readonly type = AuthActionTypes.AddCustomCharacter;

  constructor(public readonly lodestoneId: number, public readonly character: Partial<Character>) {
  }
}

export class SetDefaultCharacter implements Action {
  readonly type = AuthActionTypes.SetDefaultCharacter;

  constructor(public readonly lodestoneId: number) {
  }
}

export class VerifyCharacter implements Action {
  readonly type = AuthActionTypes.VerifyCharacter;

  constructor(public readonly lodestoneId: number) {
  }
}

export class RemoveCharacter implements Action {
  readonly type = AuthActionTypes.RemoveCharacter;

  constructor(public readonly lodestoneId: number) {
  }
}

export class SetCurrentFcId implements Action {
  readonly type = AuthActionTypes.SetCurrentFcId;

  constructor(public readonly fcId: string) {
  }
}

export class CharactersLoaded implements Action {
  readonly type = AuthActionTypes.CharactersLoaded;

  constructor(public readonly characters: CharacterResponse[]) {
  }
}

export class ToggleMasterbooks implements Action {
  readonly type = AuthActionTypes.ToggleMasterbooks;

  constructor(public readonly books: { id: number, checked: boolean }[]) {
  }
}

export class SaveSet implements Action {
  readonly type = AuthActionTypes.SaveSet;

  constructor(public readonly set: GearSet, public readonly ignoreSpecialist: boolean) {
  }
}

export class SaveDefaultConsumables implements Action {
  readonly type = AuthActionTypes.SaveDefaultConsumables;

  constructor(public readonly consumables: DefaultConsumables) {
  }
}

// Just an action to be sent once user is persisted properly
export class UserPersisted implements Action {
  readonly type = AuthActionTypes.UserPersisted;
}

// Just an action to be sent once anonymous warning has been shown
export class AnonymousWarningShown implements Action {
  readonly type = AuthActionTypes.AnonymousWarningShown;
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
  | UserPersisted
  | SetCurrentFcId
  | AnonymousWarningShown
  | ToggleFavorite
  | RemoveCharacter
  | ToggleMasterbooks
  | SaveSet
  | VerifyCharacter
  | AddCustomCharacter
  | SaveDefaultConsumables
  | UpdateUser
  | RegisterUser
  | SetCID
  | SetWorld;
