import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { ListsState } from './lists.reducer';
import { listsQuery } from './lists.selectors';
import { CreateList, DeleteList, LoadLists, UpdateList } from './lists.actions';
import { List } from '../model/list';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { filter, map } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable()
export class ListsFacade {
  loading$ = this.store.select(listsQuery.getLoading);
  allLists$ = this.store.select(listsQuery.getAllLists);
  selectedList$ = this.store.select(listsQuery.getSelectedList);

  constructor(private store: Store<{ lists: ListsState }>, private dialog: NzModalService, private translate: TranslateService) {
  }

  createEmptyList(): void {
    this.newList().subscribe(list => {
      this.addList(list);
    });
  }

  newList(): Observable<List> {
    return this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzFooter: null,
      nzTitle: this.translate.instant('New_List')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        const list = new List();
        list.name = name;
        return list;
      })
    );
  }

  addList(list: List): void {
    this.store.dispatch(new CreateList(list));
  }

  deleteList(key: string): void {
    this.store.dispatch(new DeleteList(key));
  }

  updateList(list: List): void {
    this.store.dispatch(new UpdateList(list));
  }

  loadAll(): void {
    this.store.dispatch(new LoadLists());
  }
}
