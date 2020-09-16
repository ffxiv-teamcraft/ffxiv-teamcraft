import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { DirtyPartialState } from './dirty.reducer';
import { dirtyQuery } from './dirty.selectors';
import { AddDirty, RemoveDirty } from './dirty.actions';
import { map } from 'rxjs/operators';
import { DirtyScope } from '../dirty-scope';

@Injectable({ providedIn: 'root' })
export class DirtyFacade {

  allEntries$ = this.store.pipe(select(dirtyQuery.getAllDirty));

  hasEntries$ = this.allEntries$.pipe(map(entries => entries.length > 0));

  constructor(private store: Store<DirtyPartialState>) {
  }

  public addEntry(id: string, scope: DirtyScope): void {
    this.store.dispatch(new AddDirty({ id: id, scope: scope }));
  }

  public removeEntry(id: string, scope: DirtyScope): void {
    this.store.dispatch(new RemoveDirty({ id: id, scope: scope }));
  }
}
