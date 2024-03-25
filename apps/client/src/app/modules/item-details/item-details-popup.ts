import { Component, Input, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ListRow } from '../list/model/list-row';
import { DialogComponent } from '../../core/dialog.component';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  template: ''
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ItemDetailsPopup<T = any> extends DialogComponent implements OnInit {
  @Input()
  public item: ListRow;

  @Input()
  public dbDisplay?: boolean;

  @Input()
  public details?: T;

  public details$ = new ReplaySubject<T>();

  constructor() {
    super();
  }

  ngOnInit() {
    this.patchData();
    this.details$.next(this.details);
  }
}
