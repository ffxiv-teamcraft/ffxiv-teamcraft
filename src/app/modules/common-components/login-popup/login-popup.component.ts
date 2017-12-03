import {Component} from '@angular/core';
import * as firebase from 'firebase/app';
import {MatDialog, MatDialogRef} from '@angular/material';
import {AngularFireAuth} from 'angularfire2/auth';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ForgotPasswordPopupComponent} from '../forgot-password-popup/forgot-password-popup.component';
import {UserService} from '../../../core/database/user.service';
import {ListService} from '../../../core/database/list.service';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import FacebookAuthProvider = firebase.auth.FacebookAuthProvider;
import AuthProvider = firebase.auth.AuthProvider;

@Component({
    selector: 'app-login-popup',
    templateUrl: './login-popup.component.html',
    styleUrls: ['./login-popup.component.scss']
})
export class LoginPopupComponent {

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
    }

    openForgotPasswordPopup(): void {
        this.dialog.open(ForgotPasswordPopupComponent);
    }

    login(user: any): Promise<void> {
        this.userService.loggingIn = true;
        return new Promise<void>((resolve, reject) => {
            return this.userService.get(user.uid)
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
            return this.oauth(new GoogleAuthProvider());
        });
    }

    facebookOauth(): void {
        this.router.navigate(['home']).then(() => {
            return this.oauth(new FacebookAuthProvider());
        });
    }

    classicLogin(): void {
        this.router.navigate(['home']).then(() => {
            const prevUser = this.af.auth.currentUser;
            this.listService.getUserLists(prevUser.uid).subscribe(listsBackup => {
                // Delete the previous anonymous user
                if (this.af.auth.currentUser.isAnonymous) {
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
                    .then((auth) => {
                        if (auth !== null && auth !== undefined && !auth.emailVerified) {
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
                                });
                            });
                        } else {
                            this.login(auth).then(() => {
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
            });
        });
    }

    private oauth(provider: AuthProvider): void {
        const prevUser = this.af.auth.currentUser;
        this.listService.getUserLists(prevUser.uid).subscribe(lists => {
            if (this.af.auth.currentUser.isAnonymous) {
                this.userService.deleteUser(prevUser.uid);
                this.af.auth.currentUser.delete();
            }
            this.af.auth.signInWithPopup(provider).then((oauth) => {
                this.login(oauth.user).then(() => {
                    this.dialogRef.close();
                }).catch(() => {
                    this.errorState(lists);
                });
            });
        });
    }

}
