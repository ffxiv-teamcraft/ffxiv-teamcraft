import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, Validators} from '@angular/forms';

@Component({
    selector: 'app-alarm-group-name-popup',
    templateUrl: './alarm-group-name-popup.component.html',
    styleUrls: ['./alarm-group-name-popup.component.scss']
})
export class AlarmGroupNamePopupComponent {


    public form: FormControl;

    constructor(private ref: MatDialogRef<AlarmGroupNamePopupComponent>, @Inject(MAT_DIALOG_DATA) private name: string) {
        this.form = new FormControl(name || '', Validators.required);
    }

    submit() {
        if (this.form.valid) {
            this.ref.close(this.form.value);
        }
    }
}
