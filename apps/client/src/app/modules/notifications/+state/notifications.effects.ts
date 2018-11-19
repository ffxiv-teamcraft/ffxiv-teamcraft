import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { NotificationsActionTypes, NotificationsLoaded, RemoveNotification } from './notifications.actions';
import { map, switchMap } from 'rxjs/operators';
import { NotificationService } from '../../../core/notification/notification.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { EMPTY } from 'rxjs';

@Injectable()
export class NotificationsEffects {

  @Effect()
  loadNotifications$ = this.actions$.pipe(
    ofType(NotificationsActionTypes.LoadNotifications),
    switchMap(() => this.authFacade.userId$),
    switchMap((userId) => {
      return this.notificationService.getByForeignKey(TeamcraftUser, userId);
    }),
    map(notifications => new NotificationsLoaded(notifications))
  );

  @Effect()
  removeNotification$ = this.actions$.pipe(
    ofType<RemoveNotification>(NotificationsActionTypes.RemoveNotification),
    switchMap((action) => {
      return this.notificationService.remove(action.key);
    }),
    switchMap(() => EMPTY)
  );

  constructor(
    private actions$: Actions,
    private authFacade: AuthFacade,
    private notificationService: NotificationService
  ) {
  }
}
