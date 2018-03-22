import {Component, Inject} from '@angular/core';
import {UserService} from '../../../core/database/user.service';
import {FormControl, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import 'rxjs/add/observable/timer';
import {AppUser} from 'app/model/list/app-user';

@Component({
    selector: 'app-patreon-link-popup',
    templateUrl: './patreon-link-popup.component.html',
    styleUrls: ['./patreon-link-popup.component.scss']
})
export class PatreonLinkPopupComponent {

    patreonEmail: string;

    email: FormControl = new FormControl('', [Validators.required, Validators.email]);

    alreadyUsed = false;

    constructor(private userService: UserService, private dialogRef: MatDialogRef<PatreonLinkPopupComponent>,
                @Inject(MAT_DIALOG_DATA) private user: AppUser) {
    }

    submit(): void {
        this.user.patreonEmail = this.email.value;
        this.userService.checkPatreonEmailAvailability(this.email.value)
            .first()
            .do(res => {
                if (!res) {
                    this.alreadyUsed = true;
                }
            })
            .filter(res => res)
            .mergeMap(() => {
                return this.userService.set(this.user.$key, this.user)
            })
            .subscribe(() => {
                this.dialogRef.close();
            });
    }
}
