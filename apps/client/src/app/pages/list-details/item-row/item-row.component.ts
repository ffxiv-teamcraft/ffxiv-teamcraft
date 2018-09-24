import { Component, Input } from '@angular/core';
import { ListRow } from '../../../modules/list/model/list-row';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';

@Component({
  selector: 'app-item-row',
  templateUrl: './item-row.component.html',
  styleUrls: ['./item-row.component.less']
})
export class ItemRowComponent {

  @Input()
  item: ListRow;

  @Input()
  finalItem = false;

  @Input()
  odd = false;

  constructor(private listsFacade: ListsFacade) {
  }

  itemDoneChanged(newValue: number): void {
    this.listsFacade.setItemDone(this.item.id, this.finalItem, 0);
  }
}
