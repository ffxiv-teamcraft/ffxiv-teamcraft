import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { NotificationsActionTypes, NotificationsLoaded } from './notifications.actions';
import { map, switchMap } from 'rxjs/operators';
import { NotificationService } from '../../../core/notification/notification.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';

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

  constructor(
    private actions$: Actions,
    private authFacade: AuthFacade,
    private notificationService: NotificationService
  ) {
  }
}
