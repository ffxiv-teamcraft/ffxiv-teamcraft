import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { AlarmsActionTypes, AlarmsLoaded } from './alarms.actions';
import { map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { AlarmsFacade } from './alarms.facade';
import { AuthFacade } from '../../../+state/auth.facade';

@Injectable()
export class AlarmsEffects {

  @Effect()
  loadAlarms$ = this.actions$.pipe(
    ofType(AlarmsActionTypes.LoadAlarms),
    map(() => new AlarmsLoaded([]))
  );

  @Effect()
  persistOnAdditionAndDeletion$ = this.actions$.pipe(
    ofType(AlarmsActionTypes.AddAlarms),
    mergeMap(() => EMPTY)
  );

  @Effect()
  persistAlarms$ = this.actions$.pipe(
    ofType(AlarmsActionTypes.PersistAlarms),
    withLatestFrom(this.authFacade.userId$, this.alarmsFacade.allAlarms$),
    map(([, userId, alarms]) => {
      return alarms.map(alarm => {
        return { ...alarm, foreignKey: userId };
      });
    }),
    mergeMap(() => EMPTY)
  );

  constructor(private actions$: Actions, private alarmsFacade: AlarmsFacade, private authFacade: AuthFacade) {
    this.alarmsFacade.loadAlarms();
  }
}
