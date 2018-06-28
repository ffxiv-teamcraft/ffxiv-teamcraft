import {Component, Inject} from '@angular/core';
import {AppUser} from '../../../model/list/app-user';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {UserService} from '../../../core/database/user.service';
import {first, mergeMap} from 'rxjs/operators';

@Component({
    selector: 'app-user-verification-popup',
    templateUrl: './user-verification-popup.component.html',
    styleUrls: ['./user-verification-popup.component.scss']
})
export class UserVerificationPopupComponent {

    constructor(@Inject(MAT_DIALOG_DATA) private user: AppUser, private userService: UserService,
                private ref: MatDialogRef<UserVerificationPopupComponent>) {
    }

    public check(): void {
        this.userService.getCharacter()
            .pipe(
                first(),
                mergeMap((character) => {
                    this.user.verified = character.biography.indexOf(character.user.$key) > -1;
                    return this.userService.set(this.user.$key, this.user);
                })
            )
            .subscribe(() => {
                this.ref.close();
            });
    }

}
