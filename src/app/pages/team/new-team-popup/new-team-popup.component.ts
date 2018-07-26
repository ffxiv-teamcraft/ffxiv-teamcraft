import {Component} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material';

@Component({
    selector: 'app-new-team-popup',
    templateUrl: './new-team-popup.component.html',
    styleUrls: ['./new-team-popup.component.scss']
})
export class NewTeamPopupComponent {

    public form: FormControl = new FormControl('', Validators.required);

    constructor(private ref: MatDialogRef<NewTeamPopupComponent>) {
    }

    submit() {
        if (this.form.valid) {
            this.ref.close(this.form.value);
        }
    }

}
