import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { LazyRetainerTask } from '@ffxiv-teamcraft/data/model/lazy-retainer-task';
import { CeilPipe } from '../../../pipes/pipes/ceil.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor } from '@angular/common';
import { NzListModule } from 'ng-zorro-antd/list';

@Component({
    selector: 'app-ventures',
    templateUrl: './ventures.component.html',
    styleUrls: ['./ventures.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzListModule, NgIf, FlexModule, NgFor, NzButtonModule, NzIconModule, NzToolTipModule, I18nPipe, TranslateModule, I18nRowPipe, CeilPipe]
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
