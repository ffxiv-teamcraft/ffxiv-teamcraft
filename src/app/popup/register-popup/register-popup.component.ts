import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {MdDialogRef} from '@angular/material';
import {AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;

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

    googleOauth(): void {
        this.af.auth.signInWithPopup(new GoogleAuthProvider()).then((oauth) => {
            const userRef = this.firebase.object(`/users/${oauth.user.uid}`);
            userRef.subscribe(user => {
                userRef.set({
                    email: oauth.user.email,
                    lists: this.lists
                });
                console.log(this.anonymous);
                this.firebase.object(this.anonymous).remove();
                this.dialogRef.close();
            });
        });
    }
}
