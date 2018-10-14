import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { Venture } from '../../../../model/garland-tools/venture';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';

@Component({
  selector: 'app-ventures',
  templateUrl: './ventures.component.html',
  styleUrls: ['./ventures.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VenturesComponent extends ItemDetailsPopup implements OnInit {

  DOWM = { 'en': 'Disciple of War/Magic', 'ja': '戦闘職', 'de': 'Krieger/Magier', 'fr': 'Combattant' };

  public ventures: Venture[] = [];

  constructor(private gt: GarlandToolsService) {
    super();
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

  ngOnInit(): void {
    this.ventures = this.gt.getVentures(this.item.ventures).map(venture => {
      venture.amountsDetails = this.ventureAmounts(venture);
      return venture;
    });
  }

}
