import {Component, Input} from '@angular/core';
import {List} from '../../model/list/list';

@Component({
    selector: 'app-pricing',
    templateUrl: './pricing.component.html',
    styleUrls: ['./pricing.component.scss']
})
export class PricingComponent {

    @Input()
    list: List;

    constructor() {
    }
}
