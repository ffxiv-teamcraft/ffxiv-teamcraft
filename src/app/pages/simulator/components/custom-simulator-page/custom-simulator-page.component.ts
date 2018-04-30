import {Component} from '@angular/core';
import {Craft} from '../../../../model/garland-tools/craft';

@Component({
    selector: 'app-custom-simulator-page',
    templateUrl: './custom-simulator-page.component.html',
    styleUrls: ['./custom-simulator-page.component.scss']
})
export class CustomSimulatorPageComponent {

    public recipe: Partial<Craft> = {
        rlvl: 350,
        durability: 70,
        quality: 24000,
        progress: 6500,
        ingredients: []
    };

    constructor() {
    }

}
