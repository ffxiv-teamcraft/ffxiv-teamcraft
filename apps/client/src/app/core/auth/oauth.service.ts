import { Injectable } from '@angular/core';
import { UserService } from '../database/user.service';
import { firebase } from '@firebase/app';
import '@firebase/auth';
import '@firebase/database';
import '@firebase/firestore';
import { PlatformService } from '../tools/platform.service';
import { IpcService } from '../electron/ipc.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { UserCredential } from '@firebase/auth-types';
import { from, Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class OauthService {

  constructor(private af: AngularFireAuth, private userService: UserService, private platformService: PlatformService,
              private _ipc: IpcService, private http: HttpClient) {
  }

  public login(provider: any): Observable<UserCredential> {
    let signIn$: Observable<UserCredential>;
    // If we're running inside electron, we need a special implementation.
    if (this.platformService.isDesktop()) {
      signIn$ = new Subject<UserCredential>();
      this._ipc.on('oauth-reply', (event, code) => {
        const authorizationUrl = provider.providerId === 'google.com' ?
          `https://us-central1-ffxivteamcraft.cloudfunctions.net/google-oauth${environment.production ? '' : '-beta'}?code=${code}&redirect_uri=http://localhost` :
          `\`https://us-central1-ffxivteamcraft.cloudfunctions.net/facebook-oauth${environment.production ? '' : '-beta'}?code=${code}&redirect_uri=http://localhost\``;
        this.http.get(authorizationUrl)
          .pipe(
            switchMap((res: { access_token: string }) => {
              return from(this.af.auth.signInAndRetrieveDataWithCredential(firebase.auth.GoogleAuthProvider.credential(null, res.access_token)));
            })
          )
          .subscribe(res => (<Subject<UserCredential>>signIn$).next(res));

      });
      this._ipc.send('oauth', provider.providerId);
    } else {
      signIn$ = from(this.af.auth.signInWithPopup(provider));
    }
    return signIn$;
  }
}
