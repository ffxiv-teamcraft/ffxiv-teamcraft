import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { List } from '../model/list';
import { Theme } from '../../settings/theme';
import { ListsFacade } from '../+state/lists.facade';
import { TranslateModule } from '@ngx-translate/core';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NgIf, DecimalPipe } from '@angular/common';

interface ListProgression {
  materials: number;
  items: number;
}

@Component({
    selector: 'app-list-progressbar',
    templateUrl: './list-progressbar.component.html',
    styleUrls: ['./list-progressbar.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NzProgressModule, NzToolTipModule, DecimalPipe, TranslateModule]
})
export class ListProgressbarComponent {

  @Input()
  list: List;

  @Input()
  theme: Theme;

  @Input()
  locale: string;

  constructor(private listsFacade: ListsFacade) {
  }

  getProgression(): ListProgression {
    return {
      materials: this.listsFacade.buildProgression(this.list.items),
      items: this.listsFacade.buildProgression(this.list.finalItems)
    };
  }

}
