import { Component, Input } from '@angular/core';
import { ListRow } from '../../../modules/list/model/list-row';

@Component({
  selector: 'app-item-row',
  templateUrl: './item-row.component.html',
  styleUrls: ['./item-row.component.less']
})
export class ItemRowComponent {

  @Input()
  item: ListRow;

  constructor() {
  }

}
