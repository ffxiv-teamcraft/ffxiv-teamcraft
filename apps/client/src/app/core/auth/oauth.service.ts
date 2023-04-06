import { Injectable } from '@angular/core';
import { UserService } from '../database/user.service';
import { PlatformService } from '../tools/platform.service';
import { IpcService } from '../electron/ipc.service';
import { from, Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Auth, GoogleAuthProvider, signInWithCredential, signInWithPopup, UserCredential } from '@angular/fire/auth';
import { OAuthProvider } from './o-auth-provider';

@Injectable()
export class OauthService {

  constructor(private auth: Auth, private userService: UserService, private platformService: PlatformService,
              private _ipc: IpcService, private http: HttpClient) {
  }

  public loginWithGoogle(): Observable<UserCredential> {
    let signIn$: Observable<UserCredential>;
    // If we're running inside electron, we need a special implementation.
    if (this.platformService.isDesktop()) {
      signIn$ = new Subject<UserCredential>();
      const provider = {
        authorize_url: 'https://accounts.google.com/o/oauth2/auth',
        client_id: '1082504004791-qjnubk6kj80kfvn3mg86lmu6eba16c6l.apps.googleusercontent.com',
        gcf: 'https://us-central1-ffxivteamcraft.cloudfunctions.net/google-oauth',
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/userinfo.profile'
      };
      this.desktopOauth(provider).pipe(
        switchMap((res: { access_token: string }) => {
          return from(signInWithCredential(this.auth, GoogleAuthProvider.credential(null, res.access_token)));
        })
      ).subscribe((res) => (<Subject<UserCredential>>signIn$).next(<any>res));
    } else {
      signIn$ = from(signInWithPopup(this.auth, new GoogleAuthProvider()));
    }
    return signIn$;
  }

  public desktopOauth<T = any>(provider: OAuthProvider): Observable<T> {
    return new Observable<T>(subscriber => {
      const authUrl = `${provider.authorize_url}?response_type=${provider.response_type}&redirect_uri=http://localhost:14500/oauth&client_id=${provider.client_id}&scope=${provider.scope}`;
      this._ipc.once('oauth-reply', (event, code) => {
        const params = new HttpParams().set('code', code).set('redirect_uri', 'http://localhost:14500/oauth');
        this.http.get<T>(provider.gcf, { params }).subscribe(res => {
          subscriber.next(res);
          subscriber.complete();
        });
      });
      window.open(authUrl, '_blank');
    });
  }
}
