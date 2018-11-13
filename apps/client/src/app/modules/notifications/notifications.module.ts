import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  initialState as notificationsInitialState,
  notificationsReducer
} from './+state/notifications.reducer';
import { NotificationsEffects } from './+state/notifications.effects';
import { NotificationsFacade } from './+state/notifications.facade';
import { CoreModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,

    StoreModule.forFeature('notifications', notificationsReducer, {
      initialState: notificationsInitialState
    }),
    EffectsModule.forFeature([NotificationsEffects])
  ],
  declarations: [],
  providers: [NotificationsFacade]
})
export class NotificationsModule {}
