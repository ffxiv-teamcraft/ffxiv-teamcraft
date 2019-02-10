import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { CustomItemsPartialState } from './custom-items.reducer';
import { customItemsQuery } from './custom-items.selectors';
import { LoadCustomItems } from './custom-items.actions';

@Injectable()
export class CustomItemsFacade {
  loaded$ = this.store.pipe(select(customItemsQuery.getLoaded));
  allCustomItems$ = this.store.pipe(select(customItemsQuery.getAllCustomItems));
  selectedCustomItems$ = this.store.pipe(
    select(customItemsQuery.getSelectedCustomItems)
  );

  constructor(private store: Store<CustomItemsPartialState>) {}

  loadAll() {
    this.store.dispatch(new LoadCustomItems());
  }
}
