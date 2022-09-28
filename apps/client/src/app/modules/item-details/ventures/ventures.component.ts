import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
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

  ngOnInit(): void {
    this.ventures = this.details.map(venture => {
      venture.quantities = (venture.quantities || []).map(q => {
        if (q.stat === 'perception') {
          (q as any).name = 'Perception';
        } else {
          (q as any).name = 'RETAINER_VENTURES.Retainer_ilvl';
        }
        return q;
      });
      return venture;
    });
    super.ngOnInit();
  }

}
