import {Component} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MdDialogRef} from '@angular/material';

@Component({
    selector: 'app-list-name-popup',
    templateUrl: './list-name-popup.component.html',
    styleUrls: ['./list-name-popup.component.scss']
})
export class ListNamePopupComponent {

    public form: FormControl = new FormControl('', Validators.required);

    constructor(private ref: MdDialogRef<ListNamePopupComponent>) {
    }

    submit() {
        if (this.form.valid) {
            this.ref.close(this.form.value);
        }
    }

}
