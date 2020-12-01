import { Component, Input } from '@angular/core';
import { ListRow } from '../list/model/list-row';

@Component({
  template: ''
})
// tslint:disable-next-line:component-class-suffix
export class ItemDetailsPopup {
  @Input()
  public item: ListRow;

  @Input()
  public details?: any;
}
