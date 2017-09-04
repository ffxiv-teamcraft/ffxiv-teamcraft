import {Component} from '@angular/core';
import * as firebase from 'firebase/app';
import {AngularFireDatabase} from 'angularfire2/database';
import {MdDialogRef} from '@angular/material';
import {AngularFireAuth} from 'angularfire2/auth';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import FacebookAuthProvider = firebase.auth.FacebookAuthProvider;

@Component({
    selector: 'app-login-popup',
    templateUrl: './login-popup.component.html',
    styleUrls: ['./login-popup.component.scss']
})
export class LoginPopupComponent {

    constructor(private af: AngularFireAuth,
                public dialogRef: MdDialogRef<LoginPopupComponent>,
                public firebase: AngularFireDatabase) {
    }

    login(user: any): void {
        const userRef = this.firebase.database.ref(`/users/${user.uid}`);
        userRef.once('value').then(snap => {
            if (snap.val() === null) {
                this.af.auth.signOut();
                this.af.auth.signInAnonymously();
                // TODO error message
            }else{
                this.dialogRef.close();
            }
        });
    }

    googleOauth(): void {
        this.af.auth.signInWithPopup(new GoogleAuthProvider()).then((oauth) => {
            this.login(oauth.user);
        });
    }

    facebookOauth(): void {
        this.af.auth.signInWithPopup(new FacebookAuthProvider()).then((oauth) => {
            this.login(oauth.user);
        });
    }

}
