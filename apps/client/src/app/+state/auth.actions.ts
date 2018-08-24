import { Action } from '@ngrx/store';
import { Entity } from './auth.reducer';

export enum AuthActionTypes {
  LoadAuth = '[Auth] Load Auth',
  AuthLoaded = '[Auth] Auth Loaded',
  AuthLoadError = '[Auth] Auth Load Error'
}

export class LoadAuth implements Action {
  readonly type = AuthActionTypes.LoadAuth;
}

export class AuthLoadError implements Action {
  readonly type = AuthActionTypes.AuthLoadError;
  constructor(public payload: any) {}
}

export class AuthLoaded implements Action {
  readonly type = AuthActionTypes.AuthLoaded;
  constructor(public payload: Entity[]) {}
}

export type AuthAction = LoadAuth | AuthLoaded | AuthLoadError;

export const fromAuthActions = {
  LoadAuth,
  AuthLoaded,
  AuthLoadError
};
