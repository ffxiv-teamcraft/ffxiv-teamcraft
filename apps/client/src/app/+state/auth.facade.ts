import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { AuthState } from './auth.reducer';
import { authQuery } from './auth.selectors';
import { GetUser, Logout, SetCurrentFcId, ToggleFavorite } from './auth.actions';
import { auth } from 'firebase';
import { UserCredential } from '@firebase/auth-types';
import { filter, map, tap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { PlatformService } from '../core/tools/platform.service';
import { IpcService } from '../core/electron/ipc.service';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  loaded$ = this.store.select(authQuery.getLoaded);
  mainCharacter$ = this.store.select(authQuery.getMainCharacter).pipe(filter(c => c !== null));
  linkingCharacter$ = this.store.select(authQuery.getLinkingCharacter);
  loggedIn$ = this.store.select(authQuery.getLoggedIn);
  userId$ = this.store.select(authQuery.getUserId).pipe(filter(uid => uid !== null));
  user$ = this.store.select(authQuery.getUser).pipe(filter(u => u !== undefined && u !== null));
  favorites$ = this.user$.pipe(map(user => user.favorites));
  fcId$ = this.store.select(authQuery.getMainCharacter).pipe(
    map((character) => {
      if (character === null) {
        return null;
      }
      return character.FreeCompanyId.toString();
    }),
    tap(fcId => {
      if (fcId !== null) {
        this.store.dispatch(new SetCurrentFcId(fcId));
      }
    })
  );

  constructor(private store: Store<{ auth: AuthState }>, private af: AngularFireAuth,
              private platformService: PlatformService, private ipc: IpcService) {
  }

  public loadUser(): void {
    this.store.dispatch(new GetUser());
  }

  public login(email: string, password: string): Promise<UserCredential> {
    return this.af.auth.signInWithEmailAndPassword(email, password);
  }

  public register(email: string, password: string): Promise<any> {
    return this.af.auth.createUserWithEmailAndPassword(email, password);
  }

  public googleOauth(): Promise<UserCredential> {
    return this.oauthPopup(new auth.GoogleAuthProvider());
  }

  public facebookOauth(): Promise<UserCredential> {
    return this.oauthPopup(new auth.FacebookAuthProvider());
  }

  public logout(): void {
    this.af.auth.signOut();
    this.store.dispatch(new Logout());
  }

  public toggleFavorite(dataType: 'lists' | 'workshops', key: string): void {
    this.store.dispatch(new ToggleFavorite(dataType, key));
  }

  private oauthPopup(provider: any): Promise<UserCredential> {
    return new Promise((resolve, reject) => {
      let signInPromise: Promise<any>;
      // If we're running inside electron, we need a special implementation.
      if (this.platformService.isDesktop()) {
        signInPromise = new Promise((innerResolve) => {
          this.ipc.on('oauth-reply', (event, { access_token }) => {
            this.af.auth
              .signInAndRetrieveDataWithCredential(provider.credential(null, access_token))
              .then(result => innerResolve(result));
          });
        });
        this.ipc.send('oauth', provider.providerId);
      } else {
        signInPromise = this.af.auth.signInWithPopup(provider);
      }
      return signInPromise.then((oauth) => {
        resolve(oauth);
      }).catch((error) => {
        reject(error);
      });
    });
  }
}
