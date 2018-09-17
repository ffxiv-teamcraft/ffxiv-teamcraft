import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { DataPersistence } from '@nrwl/nx';

import { ListsState } from './lists.reducer';
import {
  LoadLists,
  ListsLoaded,
  ListsLoadError,
  ListsActionTypes
} from './lists.actions';

@Injectable()
export class ListsEffects {
  @Effect()
  loadLists$ = this.dataPersistence.fetch(ListsActionTypes.LoadLists, {
    run: (action: LoadLists, state: ListsState) => {
      // Your custom REST 'load' logic goes here. For now just return an empty list...
      return new ListsLoaded([]);
    },

    onError: (action: LoadLists, error) => {
      console.error('Error', error);
      return new ListsLoadError(error);
    }
  });

  constructor(
    private actions$: Actions,
    private dataPersistence: DataPersistence<ListsState>
  ) {}
}
