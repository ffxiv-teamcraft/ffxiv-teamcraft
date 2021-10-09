import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { Venture } from '../../../model/garland-tools/venture';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { getItemSource } from '../../list/model/list-row';
import { DataType } from '../../list/data/data-type';

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
      const name = venture.ilvl ? 'RETAINER_VENTURES.Retainer_ilvl' : 'Gathering';
      if (stats) {
        amounts = stats.map((stat, i) => ({ name: name, stat: stat, quantity: venture.amounts[i] }));
      }
    }

    return amounts;
  }

  ngOnInit(): void {
    this.ventures = this.gt.getVentures(getItemSource(this.item, DataType.VENTURES)).map(venture => {
      venture.amountsDetails = this.ventureAmounts(venture);
      return venture;
    });
  }

}
