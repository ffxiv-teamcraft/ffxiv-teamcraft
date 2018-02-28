import {Component} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material';

@Component({
    selector: 'app-workshop-name-popup',
    templateUrl: './workshop-name-popup.component.html',
    styleUrls: ['./workshop-name-popup.component.scss']
})
export class WorkshopNamePopupComponent {

    public form: FormControl = new FormControl('', Validators.required);

    constructor(private ref: MatDialogRef<WorkshopNamePopupComponent>) {
    }

    submit() {
        if (this.form.valid) {
            this.ref.close(this.form.value);
        }
    }

}
