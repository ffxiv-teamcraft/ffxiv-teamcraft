import {Action} from '@ngrx/store';

export enum AuthActionTypes {
  LoadAuths = '[Auth] Load Auths'
}

export class LoadAuths implements Action {
  readonly type = AuthActionTypes.LoadAuths;
}

export type AuthActions = LoadAuths;
