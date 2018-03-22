import {Component} from '@angular/core';

@Component({
    selector: 'app-import-input-box',
    templateUrl: './import-input-box.component.html',
    styleUrls: ['./import-input-box.component.scss']
})
export class ImportInputBoxComponent {

    importString: string;

    constructor() {
    }

    importValid(): boolean {
        // First of all, the basics
        if (this.importString === undefined || this.importString.length === 0) {
            return false;
        }
        // Check if the string is a valid JSON
        try {
            const rows = JSON.parse(atob(this.importString));
            for (const row of rows) {
                if (row._filter === undefined || row._name === undefined) {
                    return false;
                }
            }
            return true;
        } catch (ignored) {
            return false;
        }
    }

}
