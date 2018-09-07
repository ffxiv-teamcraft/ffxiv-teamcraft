import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { AddAlarms, AlarmsActionTypes, AlarmsLoaded } from './alarms.actions';
import { debounceTime, first, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { combineLatest, EMPTY } from 'rxjs';
import { AlarmsFacade } from './alarms.facade';
import { AuthFacade } from '../../../+state/auth.facade';
import { Alarm } from '../alarm';
import { AlarmsService } from '../alarms.service';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';

@Injectable({
  providedIn: 'root'
})
export class AlarmsEffects {

  @Effect()
  loadAlarms$ = this.actions$.pipe(
    ofType(AlarmsActionTypes.LoadAlarms),
    withLatestFrom(this.authFacade.userId$),
    // We want to connect the observable only the first time, no need to reload as it's firestore.
    first(),
    mergeMap(([, userId]) => {
      return this.alarmsService.getByForeignKey(TeamcraftUser, userId);
    }),
    debounceTime(500),
    map((alarms) => new AlarmsLoaded(alarms))
  );

  @Effect()
  addAlarmsToDatabase$ = this.actions$
    .pipe(
      ofType(AlarmsActionTypes.AddAlarms),
      withLatestFrom(this.authFacade.userId$),
      map(([action, userId]) => {
        return (<AddAlarms>action).payload.map(alarm => {
          return new Alarm({ ...alarm, userId: userId });
        });
      }),
      mergeMap((alarms: Alarm[]) => {
        return combineLatest(
          alarms.map(alarm => {
            this.alarmsService.add(alarm);
          })
        );
      }),
      mergeMap(() => EMPTY)
    );

  constructor(private actions$: Actions, private alarmsFacade: AlarmsFacade,
              private authFacade: AuthFacade, private alarmsService: AlarmsService) {
  }
}
