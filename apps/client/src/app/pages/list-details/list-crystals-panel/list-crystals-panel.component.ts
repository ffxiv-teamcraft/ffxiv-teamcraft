import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ListRow } from '../../../modules/list/model/list-row';

@Component({
  selector: 'app-list-crystals-panel',
  templateUrl: './list-crystals-panel.component.html',
  styleUrls: ['./list-crystals-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListCrystalsPanelComponent {

  @Input()
  crystals: ListRow[] = [];

  trackByItem(index: number, item: ListRow): number {
    return item.id;
  }

}
