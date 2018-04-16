import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-fc-crest',
    templateUrl: './fc-crest.component.html',
    styleUrls: ['./fc-crest.component.scss']
})
export class FcCrestComponent {

    @Input()
    crest: [string, string, string];

    constructor() {
    }

}
