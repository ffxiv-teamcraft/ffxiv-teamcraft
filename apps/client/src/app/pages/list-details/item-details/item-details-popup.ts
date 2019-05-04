import { ListRow } from '../../../modules/list/model/list-row';
import { Input } from '@angular/core';

export class ItemDetailsPopup {
  @Input()
  public item: ListRow;
}
