import { Component, Input } from '@angular/core';
import { LayoutRowDisplay } from '../../../core/layout/layout-row-display';
import { ListRow } from '../../../modules/list/model/list-row';

@Component({
  selector: 'app-list-details-panel',
  templateUrl: './list-details-panel.component.html',
  styleUrls: ['./list-details-panel.component.less']
})
export class ListDetailsPanelComponent {

  @Input()
  displayRow: LayoutRowDisplay;

  constructor() {
  }

  trackByItem(index: number, item: ListRow): number {
    return item.id;
  }

}
