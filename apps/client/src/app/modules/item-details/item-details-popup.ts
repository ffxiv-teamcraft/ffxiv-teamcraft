import { Input, Directive } from '@angular/core';
import { ListRow } from '../list/model/list-row';

@Directive()
export class ItemDetailsPopup {
  @Input()
  public item: ListRow;

  @Input()
  public details?: any;
}
