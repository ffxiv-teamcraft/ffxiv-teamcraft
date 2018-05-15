import {Component} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {AngularFireAuth} from 'angularfire2/auth';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ForgotPasswordPopupComponent} from '../forgot-password-popup/forgot-password-popup.component';
import {UserService} from '../../../core/database/user.service';
import {ListService} from '../../../core/database/list.service';
import {firebase} from '@firebase/app';
import '@firebase/auth';
import '@firebase/database';
import '@firebase/firestore';
import {first} from 'rxjs/operators';
import {List} from '../../../model/list/list';
import {IpcRenderer} from 'electron';

@Component({
    selector: 'app-login-popup',
    templateUrl: './login-popup.component.html',
    styleUrls: ['./login-popup.component.scss']
})
export class LoginPopupComponent {

    private _ipc: IpcRenderer | undefined = void 0;

    form: FormGroup;

    public error = false;

    public notVerified = false;

    constructor(private af: AngularFireAuth,
                public dialogRef: MatDialogRef<LoginPopupComponent>,
                public userService: UserService,
                private fb: FormBuilder,
                private router: Router,
                private dialog: MatDialog,
                private listService: ListService) {

        this.form = fb.group({
            email: ['', Validators.email],
            password: ['', Validators.required],
        });
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

    openForgotPasswordPopup(): void {
        this.dialog.open(ForgotPasswordPopupComponent);
    }

    login(user: any): Promise<void> {
        this.userService.loggingIn = true;
        return new Promise<void>((resolve, reject) => {
            return this.userService.get(user.uid)
                .pipe(first())
                .subscribe(() => {
                    this.userService.loggingIn = false;
                    this.userService.reload();
                    resolve();
                }, err => {
                    this.userService.loggingIn = false;
                    this.userService.reload();
                    reject(err);
                });
        });
    }

    googleOauth(): void {
        this.router.navigate(['home']).then(() => {
            return this.oauth(new firebase.auth.GoogleAuthProvider());
        });
    }

    facebookOauth(): void {
        this.router.navigate(['home']).then(() => {
            return this.oauth(new firebase.auth.FacebookAuthProvider());
        });
    }

    classicLogin(): void {
        this.router.navigate(['home']).then(() => {
            const prevUser = this.af.auth.currentUser;
            this.listService.getUserLists(prevUser.uid)
                .pipe(first())
                .subscribe(listsBackup => {
                    // Delete the previous anonymous user
                    if (this.af.auth.currentUser !== null && this.af.auth.currentUser.isAnonymous) {
                        this.userService.deleteUser(prevUser.uid);
                        this.af.auth.currentUser.delete();
                    }
                    // Try to log in
                    this.af.auth
                        .signInWithEmailAndPassword(this.form.value.email, this.form.value.password)
                        .catch((err) => {
                            console.error(err);
                            this.errorState(listsBackup);
                        })
                        .then((authData) => {
                            if (authData.user !== null && authData.user !== undefined && !authData.user.emailVerified) {
                                // If the user didn't verify his email, send him a new one.
                                this.af.auth.currentUser.sendEmailVerification();
                                // Log out from this user, as his email isn't verified yet.
                                this.af.auth.signOut().then(() => {
                                    // Sign in anonymously again, then restore list backup to the newly created user.
                                    this.af.auth.signInAnonymously().then(user => {
                                        listsBackup.forEach(list => {
                                            list.authorId = user.uid;
                                            this.listService.add(list);
                                        });
                                        this.notVerified = true;
                                        this.userService.reload();
                                    });
                                });
                            } else {
                                this.login(authData.user).then(() => {
                                    this.userService.reload();
                                    this.dialogRef.close();
                                }).catch(() => {
                                    this.errorState(listsBackup);
                                });
                            }
                        });
                });
        });
    }

    private errorState(lists: any): void {
        this.af.auth.signOut().then(() => {
            this.af.auth.signInAnonymously().then(user => {
                lists.forEach(list => {
                    list.authorId = user.uid;
                    this.listService.add(list);
                });
                this.error = true;
                this.userService.reload();
            });
        });
    }

    private oauth(provider: any): void {
        const prevUser = this.af.auth.currentUser;
        this.listService.getUserLists(prevUser.uid)
            .pipe(first())
            .subscribe(lists => {
                if (this.af.auth.currentUser !== null && this.af.auth.currentUser.isAnonymous) {
                    this.userService.deleteUser(prevUser.uid);
                    this.af.auth.currentUser.delete();
                }
                this.doOauthSignIn(provider, lists);
            });
    }

    private doOauthSignIn(provider: any, fallbackLists: List[]): void {
        let signInPromise: Promise<any>;
        // If we're running inside electron, we need a special implementation.
        if (navigator.userAgent.toLowerCase().indexOf('electron/') > -1) {
            signInPromise = new Promise((resolve) => {
                this._ipc.on('google-oauth-reply', (event, {access_token}) => {
                    this.af.auth
                        .signInAndRetrieveDataWithCredential(firebase.auth.GoogleAuthProvider.credential(null, access_token))
                        .then(result => resolve(result));
                });
            });
            this._ipc.send('google-oauth', 'getToken');
        } else {
            signInPromise = this.af.auth.signInWithRedirect(provider);
        }
        signInPromise.then((oauth) => {
            this.login(oauth.user).then(() => {
                this.userService.reload();
                this.dialogRef.close();
            }).catch((error) => {
                console.error(error);
                this.userService.reload();
                this.errorState(fallbackLists);
            });
            this.userService.reload();
        }).catch((error) => {
            console.error(error);
            this.userService.reload();
        });
    }

}
