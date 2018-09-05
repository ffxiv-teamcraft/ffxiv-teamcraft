import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { DataPersistence } from '@nrwl/nx';

import { AlarmsState } from './alarms.reducer';

@Injectable()
export class AlarmsEffects {
  

  constructor(
    private actions$: Actions,
    private dataPersistence: DataPersistence<AlarmsState>
  ) {
  }
}
