import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {UserService} from '../../../core/database/user.service';
import {TranslateService} from '@ngx-translate/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {firebase} from '@firebase/app';
import '@firebase/auth';
import '@firebase/database';
import '@firebase/firestore';
import {OauthService} from '../../../core/auth/oauth.service';

declare const ga: Function;

@Component({
    selector: 'app-register-popup',
    templateUrl: './register-popup.component.html',
    styleUrls: ['./register-popup.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default
})
export class RegisterPopupComponent {

    public error: string;

    public form: FormGroup;

    constructor(private af: AngularFireAuth,
                public dialogRef: MatDialogRef<RegisterPopupComponent>,
                private userService: UserService,
                private dialog: MatDialog,
                private translate: TranslateService,
                private fb: FormBuilder,
                private snack: MatSnackBar,
                private oauthService: OauthService) {

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

    /**
     * Creates a user from google's oauth.
     */
    googleOauth(): void {
        this.af.auth.currentUser.linkWithPopup(new firebase.auth.GoogleAuthProvider()).then((oauth) => {
            delete this.error;
            this.oauthService.register(oauth.user).then(() => this.dialogRef.close());
        }).catch((error: any) => this.error = error.code);
    }

    /**
     * Creates a user from facebook's oauth.
     */
    facebookOauth(): void {
        this.af.auth.currentUser.linkWithPopup(new firebase.auth.FacebookAuthProvider()).then((oauth) => {
            delete this.error;
            this.oauthService.register(oauth.user).then(() => this.dialogRef.close());
        }).catch((error: any) => this.error = error.code);
    }

    /**
     * Creates a user from a classic email/password pair.
     */
    classicRegister(): void {
        const credential = firebase.auth.EmailAuthProvider.credential(this.form.value.email, this.form.value.passwords.password);
        this.af.auth.currentUser.linkWithCredential(credential).then((auth) => {
            delete this.error;
            this.oauthService.register(auth).then(() => {
                this.af.auth.currentUser.sendEmailVerification().then(() => {
                    this.snack.open(this.translate.instant('Verification_mail_sent'), '', {duration: 10000});
                    this.af.auth.signOut().then(() => {
                        this.af.auth.signInAnonymously();
                    });
                    this.dialogRef.close();
                });
            })
        }).catch((error: any) => this.error = error.code);
    }
}
