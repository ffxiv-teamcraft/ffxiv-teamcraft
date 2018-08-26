import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { DataPersistence } from '@nrwl/nx';

import { AlarmsState } from './alarms.reducer';
import {
  LoadAlarms,
  AlarmsLoaded,
  AlarmsLoadError,
  AlarmsActionTypes
} from './alarms.actions';

@Injectable()
export class AlarmsEffects {
  @Effect()
  loadAlarms$ = this.dataPersistence.fetch(AlarmsActionTypes.LoadAlarms, {
    run: (action: LoadAlarms, state: AlarmsState) => {
      // Your custom REST 'load' logic goes here. For now just return an empty list...
      return new AlarmsLoaded([]);
    },

    onError: (action: LoadAlarms, error) => {
      console.error('Error', error);
      return new AlarmsLoadError(error);
    }
  });

  constructor(
    private actions$: Actions,
    private dataPersistence: DataPersistence<AlarmsState>
  ) {}
}
