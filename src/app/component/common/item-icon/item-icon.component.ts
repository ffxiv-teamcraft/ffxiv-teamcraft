import {Component, Input} from '@angular/core';
import {I18nName} from '../../../model/list/i18n-name';

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
