import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
    selector: 'app-name-edit-popup',
    templateUrl: './name-edit-popup.component.html',
    styleUrls: ['./name-edit-popup.component.scss']
})
export class NameEditPopupComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: string, public dialogRef: MatDialogRef<NameEditPopupComponent>) {
    }

    public close(cancel = false): void {
        if (cancel) {
            this.dialogRef.close(undefined);
        } else {
            this.dialogRef.close(this.data);
        }
    }

}
