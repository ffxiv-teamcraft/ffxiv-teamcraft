import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {MdDialog, MdDialogRef} from '@angular/material';
import {AngularFireDatabase} from 'angularfire2/database';
import {CharacterAddPopupComponent} from '../character-add-popup/character-add-popup.component';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import FacebookAuthProvider = firebase.auth.FacebookAuthProvider;

@Component({
    selector: 'app-register-popup',
    templateUrl: './register-popup.component.html',
    styleUrls: ['./register-popup.component.scss']
})
export class RegisterPopupComponent implements OnInit {

    private lists: any;

    private anonymous: string;

    constructor(private af: AngularFireAuth,
                public dialogRef: MdDialogRef<RegisterPopupComponent>,
                public firebase: AngularFireDatabase) {
    }

    ngOnInit(): void {
        const idSub = this.af.idToken.subscribe(user => {
            this.anonymous = `/users/${user.uid}`;
            const firebaseSub = this.firebase.list(`/users/${user.uid}/lists`).subscribe(lists => {
                const listObj = {};
                lists.forEach(list => {
                    listObj[list.$key] = list;
                });
                this.lists = listObj;
                idSub.unsubscribe();
                firebaseSub.unsubscribe();
            });
        });
    }

    register(user: any): void {
        const userRef = this.firebase.database.ref(`/users/${user.uid}`);
        userRef.once('value').then(snap => {
            if (snap.val() === null) {
                userRef.set({
                    email: user.email,
                    lists: this.lists
                });
                this.dialogRef.close();
            } else {
                // TODO error message
            }
        });
    }

    googleOauth(): void {
        this.af.auth.signInWithPopup(new GoogleAuthProvider()).then((oauth) => {
            this.register(oauth.user);
        });
    }

    facebookOauth(): void {
        this.af.auth.signInWithPopup(new FacebookAuthProvider()).then((oauth) => {
            this.register(oauth.user);
        });
    }
}
