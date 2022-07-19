import { Component, Input, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ListRow } from '../list/model/list-row';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  template: ''
})
// tslint:disable-next-line:component-class-suffix
export class ItemDetailsPopup<T = any> implements OnInit {
  @Input()
  public item: ListRow;

  @Input()
  public details?: T;

  public details$ = new ReplaySubject<T>();

  ngOnInit() {
    this.details$.next(this.details);
  }
}
