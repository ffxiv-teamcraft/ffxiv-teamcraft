import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-item-icon',
    templateUrl: './item-icon.component.html',
    styleUrls: ['./item-icon.component.scss']
})
export class ItemIconComponent {

    @Input()
    public item: { icon: number, id: number,  HQ?: boolean };

    constructor() {
    }
}
