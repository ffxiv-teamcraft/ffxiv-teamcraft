import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { CustomItemsPartialState } from './custom-items.reducer';
import { customItemsQuery } from './custom-items.selectors';
import {
  CreateCustomItem,
  CreateCustomItemFolder,
  DeleteCustomItem,
  DeleteCustomItemFolder,
  LoadCustomItemFolders,
  LoadCustomItems,
  UpdateCustomItem,
  UpdateCustomItemFolder
} from './custom-items.actions';
import { CustomItem } from '../model/custom-item';
import { CustomItemFolder } from '../model/custom-item-folder';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomItemsDisplay } from './custom-items-display';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class CustomItemsFacade {
  loaded$ = this.store.pipe(select(customItemsQuery.getLoaded));

  foldersLoaded$ = this.store.pipe(select(customItemsQuery.getFoldersLoaded));

  allCustomItems$ = this.store.pipe(select(customItemsQuery.getAllCustomItems)).pipe(
    map(items => items.sort((a, b) => a.index - b.index))
  );

  allCustomItemFolders$ = this.store.pipe(select(customItemsQuery.getAllCustomItemFolders)).pipe(
    map(folders => folders.sort((a, b) => a.index - b.index))
  );

  customItemsDisplay$: Observable<CustomItemsDisplay> = combineLatest([this.allCustomItems$, this.allCustomItemFolders$]).pipe(
    map(([items, folders]) => {
      return {
        otherItems: items.filter(item => item !== undefined && !folders.some(folder => folder.items.some(key => key === item.$key))),
        folders: folders.map(folder => {
          return {
            folder: folder,
            items: folder.items.map(id => {
              return items.find(item => item.$key === id);
            }).filter(item => item !== undefined)
              .map(item => {
                item.folderId = folder.$key;
                return item;
              })
          };
        })
      };
    })
  );

  constructor(private store: Store<CustomItemsPartialState>, private firestore: AngularFirestore) {
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

  loadAll(): void {
    this.store.dispatch(new LoadCustomItems());
  }

  addCustomItemFolder(folder: CustomItemFolder): void {
    this.store.dispatch(new CreateCustomItemFolder(folder));
  }

  updateCustomItemFolder(folder: CustomItemFolder): void {
    this.store.dispatch(new UpdateCustomItemFolder(folder));
  }

  deleteCustomItemFolder(key: string): void {
    this.store.dispatch(new DeleteCustomItemFolder(key));
  }

  loadAllFolders() {
    this.store.dispatch(new LoadCustomItemFolders());
  }

  createId(): string {
    return this.firestore.createId();
  }
}
