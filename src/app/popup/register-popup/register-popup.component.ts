import {Component} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {MdDialog, MdDialogRef} from '@angular/material';
import {AngularFireDatabase} from 'angularfire2/database';
import {UserService} from '../../core/user.service';
import {CharacterAddPopupComponent} from 'app/popup/character-add-popup/character-add-popup.component';
import {TranslateService} from '@ngx-translate/core';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import FacebookAuthProvider = firebase.auth.FacebookAuthProvider;

@Component({
    selector: 'app-register-popup',
    templateUrl: './register-popup.component.html',
    styleUrls: ['./register-popup.component.scss']
})
export class RegisterPopupComponent {

    public error: string;

    constructor(private af: AngularFireAuth,
                public dialogRef: MdDialogRef<RegisterPopupComponent>,
                public firebase: AngularFireDatabase,
                private userService: UserService,
                private dialog: MdDialog,
                private translate: TranslateService) {
    }

    register(): void {
        this.error = undefined;
        const res = this.dialog.open(CharacterAddPopupComponent, {disableClose: true});
        res.afterClosed().subscribe(() => {
            this.dialogRef.close();
            this.userService.reload();
        });
    }

    googleOauth(): void {
        this.af.auth.currentUser.linkWithPopup(new GoogleAuthProvider()).then(() => {
            this.register();
        }).catch((error: any) => this.error = this.translate.instant(error.code));
    }

    facebookOauth(): void {
        this.af.auth.currentUser.linkWithPopup(new FacebookAuthProvider()).then(() => {
            this.register();
        }).catch((error: any) => this.error = this.translate.instant(error.code));
    }
}
