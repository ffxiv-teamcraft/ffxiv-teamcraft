import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {GarlandToolsService} from 'app/core/api/garland-tools.service';
import {Venture} from 'app/model/garland-tools/venture';

@Component({
    selector: 'app-venture-details-popup',
    templateUrl: './venture-details-popup.component.html',
    styleUrls: ['./venture-details-popup.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VentureDetailsPopupComponent {

    DOWM = { 'en': 'Disciple of War/Magic', 'ja': '戦闘職', 'de': 'Krieger/Magier', 'fr': 'Combattant' };

    public ventures: Venture[];

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private gt: GarlandToolsService) {
        this.ventures = gt.getVentures(data);
    }

    ventureAmounts(venture: Venture): any[] {
        if (venture.amounts !== undefined) {
            const stats = venture.ilvl || venture.gathering;
            const name = venture.ilvl ? 'filters/ilvl' : 'Gathering';
            return stats.map((stat, i) => ({ name: name, stat: stat, quantity: venture.amounts[i]}));
        } else {
            return [];
        }
    }
}
