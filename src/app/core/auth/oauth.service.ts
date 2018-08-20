import {Injectable} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {UserService} from '../database/user.service';
import {firebase} from '@firebase/app';
import '@firebase/auth';
import '@firebase/database';
import '@firebase/firestore';
import {AppUser} from '../../model/list/app-user';
import {first} from 'rxjs/operators';
import {PlatformService} from '../tools/platform.service';
import {IpcService} from '../electron/ipc.service';

declare const ga: Function;

@Injectable()
export class OauthService {

    constructor(private af: AngularFireAuth, private userService: UserService, private platformService: PlatformService,
                private _ipc: IpcService) {
    }

    public login(provider: any): Promise<any> {
        return new Promise((resolve, reject) => {
            let signInPromise: Promise<any>;
            // If we're running inside electron, we need a special implementation.
            if (this.platformService.isDesktop()) {
                signInPromise = new Promise((innerResolve) => {
                    this._ipc.on('oauth-reply', (event, {access_token}) => {
                        this.af.auth
                            .signInAndRetrieveDataWithCredential(firebase.auth.GoogleAuthProvider.credential(null, access_token))
                            .then(result => innerResolve(result));
                    });
                });
                this._ipc.send('oauth', provider.providerId);
            } else {
                signInPromise = this.af.auth.signInWithPopup(provider);
            }
            return signInPromise.then((oauth) => {
                resolve(oauth);
                // this.userService.reload();
            }).catch((error) => {
                reject(error);
                // this.userService.reload();
            });
        });
    }

    /**
     * Registers a user in the database.
     * @param user
     * @returns {Promise<void>}
     */
    // register(user: any): Promise<void> {
    //     return new Promise<void>((resolve) => {
    //         const u = new AppUser();
    //         u.$key = user.uid;
    //         u.email = user.email;
    //         this.userService.set(user.uid, u).pipe(first()).subscribe(() => {
    //             // this.userService.reload();
    //             ga('send', 'event', 'Site', 'signup');
    //             resolve();
    //         });
    //     });
    // }
}
