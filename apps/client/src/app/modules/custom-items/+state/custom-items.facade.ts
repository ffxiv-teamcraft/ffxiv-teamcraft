import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { CustomItemsPartialState } from './custom-items.reducer';
import { customItemsQuery } from './custom-items.selectors';
import {
  CreateCustomItem,
  DeleteCustomItem,
  LoadCustomItems,
  SelectCustomItem,
  UpdateCustomItem
} from './custom-items.actions';
import { CustomItem } from '../model/custom-item';

@Injectable({
  providedIn: 'root'
})
export class CustomItemsFacade {
  loaded$ = this.store.pipe(select(customItemsQuery.getLoaded));
  allCustomItems$ = this.store.pipe(select(customItemsQuery.getAllCustomItems));
  selectedCustomItems$ = this.store.pipe(
    select(customItemsQuery.getSelectedCustomItems)
  );

  constructor(private store: Store<CustomItemsPartialState>) {
  }

  selectCustomItem(key: string): void {
    this.store.dispatch(new SelectCustomItem(key));
  }

  addCustomItem(item: CustomItem): void {
    this.store.dispatch(new CreateCustomItem(item));
  }

  updateCustomItem(item: CustomItem): void {
    this.store.dispatch(new UpdateCustomItem(item));
  }

  deleteCustomItem(key: string): void {
    this.store.dispatch(new DeleteCustomItem(key));
  }

  loadAll() {
    this.store.dispatch(new LoadCustomItems());
  }
}
