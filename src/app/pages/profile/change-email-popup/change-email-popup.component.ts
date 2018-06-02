import {Component} from '@angular/core';
import {UserService} from '../../../core/database/user.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material';

@Component({
    selector: 'app-change-email-popup',
    templateUrl: './change-email-popup.component.html',
    styleUrls: ['./change-email-popup.component.scss']
})
export class ChangeEmailPopupComponent {

    public form: FormGroup;

    constructor(private userService: UserService, fb: FormBuilder, private dialogRef: MatDialogRef<ChangeEmailPopupComponent>) {

        this.form = fb.group({
            currentEmail: ['', [Validators.email, Validators.required]],
            password: ['', [Validators.required]],
            newEmail: ['', [Validators.email, Validators.required]],
        });
    }

    changeEmail(): void {
        this.userService.changeEmail(this.form.value.currentEmail, this.form.value.password, this.form.value.newEmail)
            .then(() => {
                this.dialogRef.close();
            });
    }

}
