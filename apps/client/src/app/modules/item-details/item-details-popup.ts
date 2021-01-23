import { Component, Input } from '@angular/core';
import { ListRow } from '../list/model/list-row';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  template: ''
})
// tslint:disable-next-line:component-class-suffix
export class ItemDetailsPopup<T = any> {
  @Input()
  public item: ListRow;

  @Input()
  public details?: T;
}
