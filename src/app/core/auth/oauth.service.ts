import {Injectable} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {UserService} from '../database/user.service';
import {IpcRenderer} from 'electron';
import {firebase} from '@firebase/app';
import '@firebase/auth';
import '@firebase/database';
import '@firebase/firestore';
import {AppUser} from '../../model/list/app-user';
import {first} from 'rxjs/operators';

declare const ga: Function;

@Injectable()
export class OauthService {

    private _ipc: IpcRenderer | undefined = void 0;

    constructor(private af: AngularFireAuth, private userService: UserService) {
        // Only load ipc if we're running inside electron
        if (navigator.userAgent.toLowerCase().indexOf('electron/') > -1) {
            if (window.require) {
                try {
                    this._ipc = window.require('electron').ipcRenderer;
                } catch (e) {
                    throw e;
                }
            } else {
                console.warn('Electron\'s IPC was not loaded');
            }
        }
    }

    public login(provider: any): Promise<any> {
        console.log(provider);
        return new Promise((resolve, reject) => {
            let signInPromise: Promise<any>;
            // If we're running inside electron, we need a special implementation.
            if (navigator.userAgent.toLowerCase().indexOf('electron/') > -1) {
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
                this.userService.reload();
            }).catch((error) => {
                reject(error);
                this.userService.reload();
            });
        });
    }

    /**
     * Registers a user in the database.
     * @param user
     * @returns {Promise<void>}
     */
    register(user: any): Promise<void> {
        return new Promise<void>((resolve) => {
            const u = new AppUser();
            u.$key = user.uid;
            u.email = user.email;
            this.userService.set(user.uid, u).pipe(first()).subscribe(() => {
                this.userService.reload();
                ga('send', 'event', 'Site', 'signup');
                resolve();
            });
        });
    }
}
