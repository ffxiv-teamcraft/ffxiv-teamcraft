import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { CustomItemsPartialState } from './custom-items.reducer';
import { customItemsQuery } from './custom-items.selectors';
import {
  CreateCustomItem,
  CreateCustomItemFolder,
  DeleteCustomItem,
  LoadCustomItemFolders,
  LoadCustomItems,
  UpdateCustomItem,
  UpdateCustomItemFolder
} from './custom-items.actions';
import { CustomItem } from '../model/custom-item';
import { CustomItemFolder } from '../model/custom-item-folder';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CustomItemsFacade {
  loaded$ = this.store.pipe(select(customItemsQuery.getLoaded));
  foldersLoaded$ = this.store.pipe(select(customItemsQuery.getFoldersLoaded));
  allCustomItems$ = this.store.pipe(select(customItemsQuery.getAllCustomItems));
  allCustomItemFolders$ = this.store.pipe(select(customItemsQuery.getAllCustomItemFolders));

  customItemsPerFolder$: Observable<{ folder: CustomItemFolder, items: CustomItem[] }[]> = combineLatest(this.allCustomItems$, this.allCustomItemFolders$).pipe(
    map(([items, folders]) => {
      return folders.map(folder => {
        return {
          folder: folder,
          items: folder.items.map(id => items.find(item => item.$key === id)).filter(item => item !== undefined)
        };
      });
    })
  );

  constructor(private store: Store<CustomItemsPartialState>) {
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

  addCustomItemFolder(folder: CustomItemFolder): void {
    this.store.dispatch(new CreateCustomItemFolder(folder));
  }

  updateCustomItemFolder(folder: CustomItemFolder): void {
    this.store.dispatch(new UpdateCustomItemFolder(folder));
  }

  deleteCustomItemFolder(key: string): void {
    this.store.dispatch(new DeleteCustomItem(key));
  }

  loadAllFolders() {
    this.store.dispatch(new LoadCustomItemFolders());
  }
}
