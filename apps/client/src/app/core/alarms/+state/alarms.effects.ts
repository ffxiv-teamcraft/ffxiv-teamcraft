import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { AddAlarms, AlarmsActionTypes, AlarmsLoaded, CreateAlarmGroup, RemoveAlarm } from './alarms.actions';
import { debounceTime, distinctUntilChanged, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { combineLatest, EMPTY } from 'rxjs';
import { AlarmsFacade } from './alarms.facade';
import { AuthFacade } from '../../../+state/auth.facade';
import { Alarm } from '../alarm';
import { AlarmsService } from '../alarms.service';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { AlarmGroupService } from '../alarm-group.service';
import { AlarmGroup } from '../alarm-group';

@Injectable({
  providedIn: 'root'
})
export class AlarmsEffects {

  @Effect()
  loadAlarms$ = this.actions$.pipe(
    ofType(AlarmsActionTypes.LoadAlarms),
    withLatestFrom(this.authFacade.userId$),
    // We want to connect the observable only the first time, no need to reload as it's firestore.
    distinctUntilChanged(),
    mergeMap(([, userId]) => {
      return combineLatest(
        this.alarmsService.getByForeignKey(TeamcraftUser, userId),
        this.alarmGroupsService.getByForeignKey(TeamcraftUser, userId)
      );
    }),
    debounceTime(500),
    map(([alarms, groups]) => new AlarmsLoaded(alarms, groups))
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

  @Effect()
  removeAlarmFromDatabase$ = this.actions$
    .pipe(
      ofType(AlarmsActionTypes.RemoveAlarm),
      mergeMap((action: RemoveAlarm) => this.alarmsService.remove(action.id)),
      mergeMap(() => EMPTY)
    );

  @Effect()
  addGroupToDatabase$ = this.actions$.pipe(
    ofType(AlarmsActionTypes.CreateAlarmGroup),
    withLatestFrom(this.authFacade.userId$),
    mergeMap(([action, userId]) => {
      const group = new AlarmGroup((<CreateAlarmGroup>action).name);
      group.userId = userId;
      return this.alarmGroupsService.add(group);
    }),
    mergeMap(() => EMPTY)
  );

  constructor(private actions$: Actions, private alarmsFacade: AlarmsFacade,
              private authFacade: AuthFacade, private alarmsService: AlarmsService,
              private alarmGroupsService: AlarmGroupService) {
  }
}
