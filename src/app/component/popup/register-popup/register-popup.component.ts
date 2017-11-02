import {Component} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {AngularFireDatabase} from 'angularfire2/database';
import {UserService} from '../../../core/user.service';
import {CharacterAddPopupComponent} from 'app/component/popup/character-add-popup/character-add-popup.component';
import {TranslateService} from '@ngx-translate/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import FacebookAuthProvider = firebase.auth.FacebookAuthProvider;
import EmailAuthProvider = firebase.auth.EmailAuthProvider;

declare const ga: Function;

@Component({
    selector: 'app-register-popup',
    templateUrl: './register-popup.component.html',
    styleUrls: ['./register-popup.component.scss']
})
export class RegisterPopupComponent {

    public error: string;

    public form: FormGroup;

    constructor(private af: AngularFireAuth,
                public dialogRef: MatDialogRef<RegisterPopupComponent>,
                public firebase: AngularFireDatabase,
                private userService: UserService,
                private dialog: MatDialog,
                private translate: TranslateService,
                private fb: FormBuilder,
                private snack: MatSnackBar) {

        this.form = fb.group({
            email: ['', Validators.email],
            passwords: fb.group({
                password: ['', Validators.required],
                password_check: ['', Validators.required]
            }, {validator: this.matchPassword})
        });
    }

    matchPassword(group): any {
        const password = group.controls.password;
        const confirm = group.controls.password_check;

        // Don't kick in until user touches both fields
        if (password.pristine || confirm.pristine) {
            return null;
        }

        // Mark group as touched so we can add invalid class easily
        group.markAsTouched();

        if (password.value === confirm.value) {
            return null;
        }

        return {
            isValid: false
        };
    }

    register(user: any): Promise<void> {
        return new Promise<void>(resolve => {
            this.error = undefined;
            const userRef = this.firebase.database.ref(`/users/${user.uid}/email`);
            userRef.once('value').then(() => {
                userRef.set(user.email);
                const res = this.dialog.open(CharacterAddPopupComponent, {disableClose: true});
                res.afterClosed().subscribe(() => {
                    this.dialogRef.close();
                    this.userService.reload();
                    ga('send', 'event', 'Site', 'signup');
                    resolve();
                });
            });
        });
    }

    googleOauth(): void {
        this.af.auth.currentUser.linkWithPopup(new GoogleAuthProvider()).then((oauth) => {
            this.register(oauth.user);
        }).catch((error: any) => this.error = this.translate.instant(error.code));
    }

    facebookOauth(): void {
        this.af.auth.currentUser.linkWithPopup(new FacebookAuthProvider()).then((oauth) => {
            this.register(oauth.user);
        }).catch((error: any) => this.error = this.translate.instant(error.code));
    }

    classicRegister(): void {
        const credential = EmailAuthProvider.credential(this.form.value.email, this.form.value.passwords.password);
        this.af.auth.currentUser.linkWithCredential(credential).then((auth) => {
            this.register(auth).then(() => {
                this.af.auth.currentUser.sendEmailVerification().then(() => {
                    this.snack.open(this.translate.instant('Verification_mail_sent'), '', {duration: 10000});
                    this.af.auth.signOut().then(() => {
                        this.af.auth.signInAnonymously();
                    });
                });
            });
        });
    }
}
