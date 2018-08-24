import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { DataPersistence } from '@nrwl/nx';

import { AuthState } from './auth.reducer';
import {
  LoadAuth,
  AuthLoaded,
  AuthLoadError,
  AuthActionTypes
} from './auth.actions';

@Injectable()
export class AuthEffects {
  @Effect()
  loadAuth$ = this.dataPersistence.fetch(AuthActionTypes.LoadAuth, {
    run: (action: LoadAuth, state: AuthState) => {
      // Your custom REST 'load' logic goes here. For now just return an empty list...
      return new AuthLoaded([]);
    },

    onError: (action: LoadAuth, error) => {
      console.error('Error', error);
      return new AuthLoadError(error);
    }
  });

  constructor(
    private actions$: Actions,
    private dataPersistence: DataPersistence<AuthState>
  ) {}
}
