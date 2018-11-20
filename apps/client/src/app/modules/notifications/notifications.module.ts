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
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    TranslateModule,

    StoreModule.forFeature('notifications', notificationsReducer, {
      initialState: notificationsInitialState
    }),
    EffectsModule.forFeature([NotificationsEffects])
  ],
  declarations: [],
  providers: [NotificationsFacade]
})
export class NotificationsModule {}
