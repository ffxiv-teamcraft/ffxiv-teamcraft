import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { AuthState } from './auth.reducer';
import { authQuery } from './auth.selectors';
import { LoadAuth } from './auth.actions';

@Injectable()
export class AuthFacade {
  loaded$ = this.store.select(authQuery.getLoaded);
  allAuth$ = this.store.select(authQuery.getAllAuth);
  selectedAuth$ = this.store.select(authQuery.getSelectedAuth);

  constructor(private store: Store<{ auth: AuthState }>) {}

  loadAll() {
    this.store.dispatch(new LoadAuth());
  }
}
