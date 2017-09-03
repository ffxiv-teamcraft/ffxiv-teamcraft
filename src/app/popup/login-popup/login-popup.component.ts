import {Component} from '@angular/core';
import * as firebase from 'firebase/app';
import {AngularFireDatabase} from 'angularfire2/database';
import {MdDialogRef} from '@angular/material';
import {AngularFireAuth} from 'angularfire2/auth';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;

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

    googleOauth(): void {
        this.af.auth.signInWithPopup(new GoogleAuthProvider()).then((oauth) => {
            const userRef = this.firebase.object(`/users/${oauth.user.uid}`);
            userRef.subscribe(user => {
                if (user.$value === null) {
                    this.af.auth.signOut();
                    this.af.auth.signInAnonymously();
                }
            });
        });
    }

}
