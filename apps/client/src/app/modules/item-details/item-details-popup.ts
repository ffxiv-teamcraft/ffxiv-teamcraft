import { Input } from '@angular/core';
import { ListRow } from '../list/model/list-row';

export class ItemDetailsPopup {
  @Input()
  public item: ListRow;

  @Input()
  public details?: any;
}
