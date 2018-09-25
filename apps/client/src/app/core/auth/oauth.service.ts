import { Injectable } from '@angular/core';
import { UserService } from '../database/user.service';
import { firebase } from '@firebase/app';
import '@firebase/auth';
import '@firebase/database';
import '@firebase/firestore';
import { PlatformService } from '../tools/platform.service';
import { IpcService } from '../electron/ipc.service';
import { AngularFireAuth } from '@angular/fire/auth';

declare const ga: Function;

@Injectable()
export class OauthService {

  constructor(private af: AngularFireAuth, private userService: UserService, private platformService: PlatformService,
              private _ipc: IpcService) {
  }

  public login(provider: any): Promise<any> {
    let signInPromise: Promise<any>;
    // If we're running inside electron, we need a special implementation.
    if (this.platformService.isDesktop()) {
      signInPromise = new Promise((innerResolve) => {
        this._ipc.on('oauth-reply', (event, { access_token }) => {
          this.af.auth
            .signInAndRetrieveDataWithCredential(firebase.auth.GoogleAuthProvider.credential(null, access_token))
            .then(result => innerResolve(result));
        });
      });
      this._ipc.send('oauth', provider.providerId);
    } else {
      signInPromise = this.af.auth.signInWithPopup(provider);
    }
    return signInPromise;
  }
}
