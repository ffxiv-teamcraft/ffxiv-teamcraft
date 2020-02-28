import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { List } from '../model/list';
import { Theme } from '../../settings/theme';
import { ListsFacade } from '../+state/lists.facade';

interface ListProgression {
  materials: number;
  items: number;
}

@Component({
  selector: 'app-list-progressbar',
  templateUrl: './list-progressbar.component.html',
  styleUrls: ['./list-progressbar.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
