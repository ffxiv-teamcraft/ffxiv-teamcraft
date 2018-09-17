import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { ListsState } from './lists.reducer';
import { listsQuery } from './lists.selectors';
import { LoadLists } from './lists.actions';

@Injectable()
export class ListsFacade {
  loaded$ = this.store.select(listsQuery.getLoaded);
  allLists$ = this.store.select(listsQuery.getAllLists);
  selectedLists$ = this.store.select(listsQuery.getSelectedLists);

  constructor(private store: Store<{ lists: ListsState }>) {}

  loadAll() {
    this.store.dispatch(new LoadLists());
  }
}
