import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { Venture } from '../../../model/garland-tools/venture';
import { LazyRetainerTask } from '../../../lazy-data/model/lazy-retainer-task';

@Component({
  selector: 'app-ventures',
  templateUrl: './ventures.component.html',
  styleUrls: ['./ventures.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VenturesComponent extends ItemDetailsPopup<LazyRetainerTask[]> implements OnInit {

  DOWM = { 'en': 'Disciple of War/Magic', 'ja': '戦闘職', 'de': 'Krieger/Magier', 'fr': 'Combattant' };

  public ventures: LazyRetainerTask[] = [];

  constructor() {
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
    this.ventures = this.details.map(venture => {
      venture.quantities = (venture.quantities || []).map(q => {
        if (q.stat === 'gathering') {
          (q as any).stat = 'Gathering';
        } else {
          (q as any).stat = 'RETAINER_VENTURES.Retainer_ilvl';
        }
        return q;
      });
      return venture;
    });
  }

}
