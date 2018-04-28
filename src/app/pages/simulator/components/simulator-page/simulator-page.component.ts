import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Craft} from '../../../../model/garland-tools/craft';
import {Observable} from 'rxjs/Observable';
import {DataService} from '../../../../core/api/data.service';

@Component({
    selector: 'app-simulator-page',
    templateUrl: './simulator-page.component.html',
    styleUrls: ['./simulator-page.component.scss']
})
export class SimulatorPageComponent {

    public recipe$: Observable<Craft>;

    public itemId: number;

    public itemIcon: number;

    constructor(private activeRoute: ActivatedRoute, private data: DataService) {
        this.recipe$ = activeRoute.params
            .mergeMap(params => {
                return data.getItem(params.itemId)
                    .map(item => {
                        this.itemId = params.itemId;
                        this.itemIcon = item.item.icon;
                        // Because only crystals change between recipes, we take the first one.
                        return item.item.craft[0];
                    });
            });
    }

}
