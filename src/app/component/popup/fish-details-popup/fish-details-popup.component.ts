import {Component, Inject, OnInit} from '@angular/core';
import {MD_DIALOG_DATA} from '@angular/material';
import {DataService} from '../../../core/api/data.service';
import {Fish} from '../../../model/garland-tools/fish';
import {ListRow} from '../../../model/list/list-row';
import {GarlandToolsService} from '../../../core/api/garland-tools.service';
import {GatheringNode} from '../../../model/garland-tools/gathering-node';
import {ItemData} from '../../../model/garland-tools/item-data';
import {I18nName} from '../../../model/list/i18n-name';
import {LocalizedDataService} from '../../../core/data/localized-data.service';

@Component({
    selector: 'app-fish-details-popup',
    templateUrl: './fish-details-popup.component.html',
    styleUrls: ['./fish-details-popup.component.scss']
})
export class FishDetailsPopupComponent implements OnInit {

    data: ItemData;

    fish: Fish;

    loading = true;

    constructor(@Inject(MD_DIALOG_DATA) public item: ListRow, private api: DataService,
                private gt: GarlandToolsService, private i18nData: LocalizedDataService) {
    }

    getNode(id: number): GatheringNode {
        return this.gt.getFishingSpot(id);
    }

    getBaitIcon(id: number): number {
        return this.data.getPartial(id.toString()).obj.c;
    }

    getWeatherName(weather: string): I18nName {
        return this.i18nData.getWeather(weather);
    }

    ngOnInit() {
        this.api.getItem(this.item.id)
            .subscribe(data => {
                this.fish = data.item.fish;
                this.data = data;
                this.loading = false;
            });
    }

}
