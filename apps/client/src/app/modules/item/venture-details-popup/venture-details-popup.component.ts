import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Venture } from '../../../model/garland-tools/venture';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';

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
    let amounts = [];

    if (venture.amounts !== undefined) {
      const stats = venture.ilvl || venture.gathering;
      const name = venture.ilvl ? 'filters/ilvl' : 'Gathering';
      if (stats) {
        amounts = stats.map((stat, i) => ({ name: name, stat: stat, quantity: venture.amounts[i] }));
      }
    }

    return amounts;
  }
}
