import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { GarlandToolsService } from './api/garland-tools.service';
import { DataService } from './api/data.service';
import { NgSerializerModule } from '@kaiu/ng-serializer';
import { I18nPipe } from '../pipes/i18n.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedDataService } from './data/localized-data.service';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { MatButtonModule, MatDialogModule } from '@angular/material';
import { PushNotificationsModule } from 'ng-push';
import { AbstractNotification } from './notification/abstract-notification';
import { ListProgressNotification } from '../model/notification/list-progress-notification';
import { TeamInviteNotification } from '../model/notification/team-invite-notification';
import { TeamExclusionNotification } from '../model/notification/team-exclusion-notification';
import { ItemAssignedNotification } from '../model/notification/item-assigned-notification';
import { ListCommentNotification } from '../model/notification/list-comment-notification';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { UserService } from './database/user.service';
import { PendingChangesService } from './database/pending-changes/pending-changes.service';
import { IpcService } from './electron/ipc.service';
import { PlatformService } from './tools/platform.service';
import { MathToolsService } from './tools/math-tools';
import { I18nToolsService } from './tools/i18n-tools.service';
import { BellNodesService } from './data/bell-nodes.service';
import { EorzeanTimeService } from './time/eorzean-time.service';
import { TimerPipe } from './time/timer.pipe';


@NgModule({
  imports: [
    HttpClientModule,
    NgSerializerModule.forChild([
      {
        parent: AbstractNotification,
        children: {
          LIST_PROGRESS: ListProgressNotification,
          TEAM_INVITE: TeamInviteNotification,
          TEAM_EXCLUSION: TeamExclusionNotification,
          ITEM_ASSIGNED: ItemAssignedNotification,
          LIST_COMMENT: ListCommentNotification
        }
      }
    ]),
    TranslateModule,
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    MatDialogModule,
    MatButtonModule,
    PushNotificationsModule
  ],
  providers: [
    UserService,
    PendingChangesService,
    GarlandToolsService,
    IpcService,
    PlatformService,
    DataService,
    MathToolsService,
    LocalizedDataService,
    I18nToolsService,
    BellNodesService,
    EorzeanTimeService
  ],
  declarations: [
    I18nPipe,
    TimerPipe
  ],
  exports: [
    I18nPipe,
    TranslateModule,
    AngularFireModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    PushNotificationsModule,
    TimerPipe
  ]
})
export class CoreModule {
}
