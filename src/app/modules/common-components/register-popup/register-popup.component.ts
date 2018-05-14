import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {UserService} from '../../../core/database/user.service';
import {CharacterAddPopupComponent} from 'app/modules/common-components/character-add-popup/character-add-popup.component';
import {TranslateService} from '@ngx-translate/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AppUser} from '../../../model/list/app-user';
import {first} from 'rxjs/operators';
import * as firebase from 'firebase';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import FacebookAuthProvider = firebase.auth.FacebookAuthProvider;
import EmailAuthProvider = firebase.auth.EmailAuthProvider;

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

    /**
     * Registers a user in the database.
     * @param user
     * @returns {Promise<void>}
     */
    register(user: any): Promise<void> {
        return new Promise<void>(resolve => {
            this.error = undefined;
            const u = new AppUser();
            u.$key = user.uid;
            u.email = user.email;
            this.userService.set(user.uid, u).pipe(first()).subscribe(() => {
                this.dialog.open(CharacterAddPopupComponent, {disableClose: true}).afterClosed().subscribe(() => {
                    this.dialogRef.close();
                    this.userService.reload();
                    ga('send', 'event', 'Site', 'signup');
                    resolve();
                });
            });
        });
    }

    /**
     * Creates a user from google's oauth.
     */
    googleOauth(): void {
        this.af.auth.currentUser.linkWithPopup(new GoogleAuthProvider()).then((oauth) => {
            this.register(oauth.user);
        }).catch((error: any) => this.error = error.code);
    }

    /**
     * Creates a user from facebook's oauth.
     */
    facebookOauth(): void {
        this.af.auth.currentUser.linkWithPopup(new FacebookAuthProvider()).then((oauth) => {
            this.register(oauth.user);
        }).catch((error: any) => this.error = error.code);
    }

    /**
     * Creates a user from a classic email/password pair.
     */
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
            })
        }).catch((error: any) => this.error = error.code);
    }
}
