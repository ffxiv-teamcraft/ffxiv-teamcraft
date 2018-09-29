import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  AddAlarms,
  AlarmsActionTypes,
  AlarmsCreated,
  AlarmsLoaded,
  AssignGroupToAlarm,
  CreateAlarmGroup,
  DeleteAlarmGroup,
  RemoveAlarm,
  UpdateAlarm,
  UpdateAlarmGroup
} from './alarms.actions';
import { bufferTime, debounceTime, distinctUntilChanged, filter, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { combineLatest, EMPTY } from 'rxjs';
import { AlarmsFacade } from './alarms.facade';
import { AuthFacade } from '../../../+state/auth.facade';
import { Alarm } from '../alarm';
import { AlarmsService } from '../alarms.service';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { AlarmGroupService } from '../alarm-group.service';
import { AlarmGroup } from '../alarm-group';
import { NzMessageService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';

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
            return this.alarmsService.add(alarm);
          })
        );
      }),
      map((alarms) => new AlarmsCreated(alarms.length))
    );


  @Effect()
  updateAlarmInDatabase$ = this.actions$
    .pipe(
      ofType(AlarmsActionTypes.UpdateAlarm),
      mergeMap((action: UpdateAlarm) => this.alarmsService.update(action.alarm.$key, action.alarm)),
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
  clearLocalstorageOnAlarmDelete$ = this.actions$
    .pipe(
      ofType(AlarmsActionTypes.RemoveAlarm),
      map((action: RemoveAlarm) => localStorage.removeItem(`played:${action.id}`)),
      mergeMap(() => EMPTY)
    );

  @Effect()
  addGroupToDatabase$ = this.actions$.pipe(
    ofType(AlarmsActionTypes.CreateAlarmGroup),
    withLatestFrom(this.authFacade.userId$),
    mergeMap(([_action, userId]) => {
      const action = <CreateAlarmGroup>_action;
      const group = new AlarmGroup(action.name, action.index);
      group.userId = userId;
      return this.alarmGroupsService.add(group);
    }),
    mergeMap(() => EMPTY)
  );

  @Effect()
  deleteGroupFromDatabase = this.actions$.pipe(
    ofType(AlarmsActionTypes.DeleteAlarmGroup),
    mergeMap((action: DeleteAlarmGroup) => {
      return this.alarmGroupsService.remove(action.id);
    }),
    mergeMap(() => EMPTY)
  );

  @Effect()
  updateGroupInsideDatabase$ = this.actions$.pipe(
    ofType(AlarmsActionTypes.UpdateAlarmGroup),
    withLatestFrom(this.alarmsFacade.allGroups$),
    mergeMap(([_action, groups]) => {
      const action = <UpdateAlarmGroup>_action;
      const editedGroup = groups.find(group => group.$key === action.group.$key);
      return this.alarmGroupsService.set(editedGroup.$key, editedGroup);
    }),
    mergeMap(() => EMPTY)
  );

  @Effect()
  saveAlarmGroupAssignment$ = this.actions$.pipe(
    ofType(AlarmsActionTypes.AssignGroupToAlarm),
    withLatestFrom(this.alarmsFacade.allAlarms$),
    mergeMap(([action, alarms]) => {
      const alarm = alarms.find(a => a.$key === (<AssignGroupToAlarm>action).alarm.$key);
      return this.alarmsService.set(alarm.$key, alarm);
    }),
    mergeMap(() => EMPTY)
  );

  @Effect()
  showAlarmsCreatedNotification$ = this.actions$.pipe(
    ofType(AlarmsActionTypes.AlarmsCreated),
    bufferTime(300),
    filter(actions => actions.length > 0),
    tap((creations: AlarmsCreated[]) => {
      const amount = creations.reduce((count, c) => {
        return count + c.amount;
      }, 0);
      const label = amount === 1
        ? this.translate.instant('ALARMS.Alarm_created')
        : this.translate.instant('ALARMS.Alarms_created', { amount: amount });
      this.message.success(label, {
        nzDuration: 2000
      });
    }),
    mergeMap(() => EMPTY)
  );

  constructor(private actions$: Actions, private alarmsFacade: AlarmsFacade,
              private authFacade: AuthFacade, private alarmsService: AlarmsService,
              private alarmGroupsService: AlarmGroupService, private message: NzMessageService,
              private translate: TranslateService) {
  }
}
