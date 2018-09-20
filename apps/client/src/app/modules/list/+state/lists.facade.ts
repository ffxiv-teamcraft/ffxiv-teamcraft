import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { ListsState } from './lists.reducer';
import { listsQuery } from './lists.selectors';
import { CreateList, DeleteList, LoadLists } from './lists.actions';
import { List } from '../model/list';

@Injectable()
export class ListsFacade {
  loading$ = this.store.select(listsQuery.getLoading);
  allLists$ = this.store.select(listsQuery.getAllLists);
  selectedList$ = this.store.select(listsQuery.getSelectedList);

  constructor(private store: Store<{ lists: ListsState }>) {
  }

  createEmptyList(name: string): void {
    const list = new List();
    list.name = name;
    this.store.dispatch(new CreateList(list));
  }

  deleteList(key: string): void {
    this.store.dispatch(new DeleteList(key));
  }

  loadAll(): void {
    this.store.dispatch(new LoadLists());
  }
}
