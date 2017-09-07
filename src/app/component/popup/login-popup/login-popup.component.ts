import {Component} from '@angular/core';
import * as firebase from 'firebase/app';
import {AngularFireDatabase} from 'angularfire2/database';
import {MdDialogRef} from '@angular/material';
import {AngularFireAuth} from 'angularfire2/auth';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import FacebookAuthProvider = firebase.auth.FacebookAuthProvider;
import AuthProvider = firebase.auth.AuthProvider;
import EmailAuthProvider = firebase.auth.EmailAuthProvider;
import {Router} from '@angular/router';

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
                public dialogRef: MdDialogRef<LoginPopupComponent>,
                public firebase: AngularFireDatabase,
                private fb: FormBuilder,
                private router: Router) {

        this.form = fb.group({
            email: ['', Validators.email],
            password: ['', Validators.required],
        });
    }

    login(user: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const userRef = this.firebase.database.ref(`/users/${user.uid}`);
            userRef.once('value').then(snap => {
                if (snap.val() === null) {
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }

    googleOauth(): void {
        this.router.navigate(['recipes']).then(() => {
            return this.oauth(new GoogleAuthProvider());
        });
    }

    facebookOauth(): void {
        this.router.navigate(['recipes']).then(() => {
            return this.oauth(new FacebookAuthProvider());
        });
    }

    classicLogin(): void {
        this.router.navigate(['recipes']).then(() => {
            const prevUser = this.af.auth.currentUser;
            this.firebase.database.ref(`/users/${prevUser.uid}/lists`)
                .once('value')
                .then(snap => snap.val())
                .then(lists => {
                    if (this.af.auth.currentUser.isAnonymous) {
                        this.firebase.object(`/users/${prevUser.uid}`).remove();
                        this.af.auth.currentUser.delete();
                    }
                    this.af.auth
                        .signInWithEmailAndPassword(this.form.value.email, this.form.value.password)
                        .catch(() => {
                            this.errorState(lists);
                        })
                        .then((auth) => {
                            if (!auth.emailVerified) {
                                this.af.auth.currentUser.sendEmailVerification();
                                this.af.auth.signOut().then(() => {
                                    this.af.auth.signInAnonymously().then(user => {
                                        this.firebase.database
                                            .ref(`/users/${user.uid}/lists`)
                                            .set(lists);
                                        this.notVerified = true;
                                    });
                                });
                            } else {
                                this.login(auth).then(() => {
                                    this.dialogRef.close();
                                }).catch(() => {
                                    this.errorState(lists);
                                });
                            }
                        });
                });
        });
    }

    private errorState(lists: any): void {
        this.af.auth.signOut().then(() => {
            this.af.auth.signInAnonymously().then(user => {
                this.firebase.database
                    .ref(`/users/${user.uid}/lists`)
                    .set(lists);
                this.error = true;
            });
        });
    }

    private oauth(provider: AuthProvider): void {
        const prevUser = this.af.auth.currentUser;
        this.firebase.database.ref(`/users/${prevUser.uid}/lists`)
            .once('value')
            .then(snap => snap.val())
            .then(lists => {
                if (this.af.auth.currentUser.isAnonymous) {
                    this.firebase.object(`/users/${prevUser.uid}`).remove();
                    this.af.auth.currentUser.delete();
                }
                this.af.auth.signInWithPopup(provider).then((oauth) => {
                    this.login(oauth.user).then(() => {
                        this.dialogRef.close();
                    }).catch(() => {
                        this.af.auth.signOut().then(() => {
                            this.af.auth.signInAnonymously().then(user => {
                                this.firebase.database
                                    .ref(`/users/${user.uid}/lists`)
                                    .set(lists);
                                this.dialogRef.close();
                            });
                        });
                    });
                });
            });
    }

}
