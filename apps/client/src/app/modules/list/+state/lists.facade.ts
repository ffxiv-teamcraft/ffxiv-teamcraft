import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { ListsState } from './lists.reducer';
import { listsQuery } from './lists.selectors';
import { CreateList, DeleteList, LoadList, LoadMyLists, SelectList, SetItemDone, UpdateList } from './lists.actions';
import { List } from '../model/list';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { filter, map } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';

declare const ga: Function;

@Injectable()
export class ListsFacade {
  loadingMyLists$ = this.store.select(listsQuery.getMylistsLoading);
  allLists$ = this.store.select(listsQuery.getAllLists);
  myLists$ = combineLatest(this.store.select(listsQuery.getAllMyLists), this.authFacade.userId$).pipe(
    map(([lists, userId]) => lists.filter(list => list.authorId === userId))
  );
  selectedList$ = this.store.select(listsQuery.getSelectedList);

  constructor(private store: Store<{ lists: ListsState }>, private dialog: NzModalService, private translate: TranslateService,
              private authFacade: AuthFacade) {
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

  newEphemeralList(itemName: string): List {
    const list = new List();
    list.ephemeral = true;
    list.name = itemName;
    return list;
  }

  setItemDone(itemId: number, finalItem: boolean, delta: number): void {
    this.store.dispatch(new SetItemDone(itemId, finalItem, delta))
  }

  addList(list: List): void {
    this.store.dispatch(new CreateList(list));
    ga('send', 'event', 'List', 'creation');
  }

  deleteList(key: string): void {
    this.store.dispatch(new DeleteList(key));
    ga('send', 'event', 'List', 'deletion');
  }

  updateList(list: List): void {
    this.store.dispatch(new UpdateList(list));
  }

  loadAll(): void {
    this.store.dispatch(new LoadMyLists());
  }

  load(key: string): void {
    this.store.dispatch(new LoadList(key));
  }

  select(key: string): void {
    this.store.dispatch(new SelectList(key));
  }
}
