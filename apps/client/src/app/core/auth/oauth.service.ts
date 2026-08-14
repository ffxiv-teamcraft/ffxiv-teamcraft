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
      const subject = new Subject<UserCredential>();
      signIn$ = subject;
      const provider = {
        authorize_url: 'https://accounts.google.com/o/oauth2/auth',
        client_id: '1082504004791-qjnubk6kj80kfvn3mg86lmu6eba16c6l.apps.googleusercontent.com',
        gcf: 'https://us-central1-ffxivteamcraft.cloudfunctions.net/google-oauth',
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/userinfo.profile'
      };
      this.desktopOauth(provider).pipe(
        switchMap((res: { access_token: string }) => {
          this.log(`[oauth] code exchange OK, access_token present: ${!!res?.access_token}`);
          return from(signInWithCredential(this.auth, GoogleAuthProvider.credential(null, res.access_token)));
        })
      ).subscribe({
        next: (res) => {
          this.log('[oauth] signInWithCredential OK');
          subject.next(<any>res);
        },
        // Without this, any failure in the exchange or Firebase sign-in was
        // swallowed and the login modal hung forever. Surface it instead.
        error: (err) => {
          this.log(`[oauth] login FAILED at sign-in: ${this.describeError(err)}`);
          subject.error(err);
        }
      });
    } else {
      signIn$ = from(signInWithPopup(this.auth, new GoogleAuthProvider()));
    }
    return signIn$;
  }

  public desktopOauth<T = any>(provider: OAuthProvider): Observable<T> {
    return new Observable<T>(subscriber => {
      const authUrl = `${provider.authorize_url}?response_type=${provider.response_type}&redirect_uri=http://localhost:14500/oauth&client_id=${provider.client_id}&scope=${provider.scope}`;
      this._ipc.once('oauth-reply', (event, code) => {
        this.log(`[oauth] oauth-reply received, code present: ${!!code}`);
        const params = new HttpParams().set('code', code).set('redirect_uri', 'http://localhost:14500/oauth');
        this.http.get<T>(provider.gcf, { params }).subscribe({
          next: res => {
            subscriber.next(res);
            subscriber.complete();
          },
          error: err => {
            this.log(`[oauth] code exchange request to gcf failed: ${this.describeError(err)}`);
            subscriber.error(err);
          }
        });
      });
      window.open(authUrl, '_blank');
    });
  }

  /** Forwards a message to the Electron main process so it lands in main.log. */
  private log(message: string): void {
    console.log(message);
    try {
      this._ipc.send('log', message);
    } catch (e) {
      // Not running in Electron / ipc unavailable — console is enough.
    }
  }

  /** Flattens HTTP and Firebase auth errors into a single diagnostic string. */
  private describeError(err: any): string {
    if (!err) {
      return 'unknown error';
    }
    const parts: string[] = [];
    if (err.code) parts.push(`code=${err.code}`);
    if (err.status !== undefined) parts.push(`httpStatus=${err.status}`);
    if (err.message) parts.push(`message=${err.message}`);
    if (err.error && typeof err.error === 'object' && err.error.message) parts.push(`body=${err.error.message}`);
    if (parts.length === 0) {
      try {
        parts.push(JSON.stringify(err));
      } catch {
        parts.push(String(err));
      }
    }
    return parts.join(' ');
  }
}
