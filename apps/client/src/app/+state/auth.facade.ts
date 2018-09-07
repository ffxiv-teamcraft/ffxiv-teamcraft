import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { AuthState } from './auth.reducer';
import { authQuery } from './auth.selectors';
import { GetUser, Logout } from './auth.actions';
import { auth } from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { UserCredential } from '@firebase/auth-types';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  loaded$ = this.store.select(authQuery.getLoaded);
  mainCharacter$ = this.store.select(authQuery.getMainCharacter);
  loggedIn$ = this.store.select(authQuery.getLoggedIn);
  userId$ = this.store.select(authQuery.getUserId).pipe(filter(uid => uid !== null));

  constructor(private store: Store<{ auth: AuthState }>, private af: AngularFireAuth) {
  }

  public loadUser():void{
    this.store.dispatch(new GetUser());
  }

  public login(email: string, password: string): Promise<UserCredential> {
    return this.af.auth.signInWithEmailAndPassword(email, password);
  }

  public register(email: string, password: string): Promise<any> {
    return this.af.auth.createUserWithEmailAndPassword(email, password);
  }

  public googleOauth(): Promise<UserCredential> {
    return this.af.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  public facebookOauth(): Promise<UserCredential> {
    return this.af.auth.signInWithPopup(new auth.FacebookAuthProvider());
  }

  public logout(): void {
    this.af.auth.signOut();
    this.store.dispatch(new Logout());
  }
}
