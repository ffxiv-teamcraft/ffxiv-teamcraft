import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { AuthState } from './auth.reducer';
import { authQuery } from './auth.selectors';
import { GetUser } from './auth.actions';

@Injectable()
export class AuthFacade {
  loaded$ = this.store.select(authQuery.getLoaded);
  mainCharacter$ = this.store.select(authQuery.getMainCharacter);
  loggedIn$ = this.store.select(authQuery.getLoggedIn);

  constructor(private store: Store<{ auth: AuthState }>) {
    this.load();
  }

  load() {
    this.store.dispatch(new GetUser());
  }
}
