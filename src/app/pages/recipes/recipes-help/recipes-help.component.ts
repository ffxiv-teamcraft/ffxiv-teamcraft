import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
    selector: 'app-recipes-help',
    templateUrl: './recipes-help.component.html',
    styleUrls: ['./recipes-help.component.scss']
})
export class RecipesHelpComponent {

    constructor(private dialogRef: MatDialogRef<RecipesHelpComponent>) {
    }

    close() {
        this.dialogRef.close();
    }

}
