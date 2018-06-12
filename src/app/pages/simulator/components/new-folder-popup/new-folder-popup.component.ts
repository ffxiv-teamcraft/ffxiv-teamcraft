import {Component, Inject} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
    selector: 'app-new-folder-popup',
    templateUrl: './new-folder-popup.component.html',
    styleUrls: ['./new-folder-popup.component.scss']
})
export class NewFolderPopupComponent {

    public form: FormControl;

    constructor(private ref: MatDialogRef<NewFolderPopupComponent>, @Inject(MAT_DIALOG_DATA) private name: string) {
        this.form = new FormControl(name || '', Validators.required);
    }

    submit() {
        if (this.form.valid) {
            this.ref.close(this.form.value);
        }
    }

}
