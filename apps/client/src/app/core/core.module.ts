import { ModuleWithProviders, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { GarlandToolsService } from './api/garland-tools.service';
import { DataService } from './api/data.service';
import { NgSerializerModule } from '@kaiu/ng-serializer';
import { I18nPipe } from '../pipes/i18n.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedDataService } from './data/localized-data.service';
import { PushNotificationsModule } from 'ng-push';
import { AbstractNotification } from './notification/abstract-notification';
import { ListCommentNotification } from '../model/notification/list-comment-notification';
import { UserService } from './database/user.service';
import { PendingChangesService } from './database/pending-changes/pending-changes.service';
import { IpcService } from './electron/ipc.service';
import { PlatformService } from './tools/platform.service';
import { MathToolsService } from './tools/math-tools';
import { I18nToolsService } from './tools/i18n-tools.service';
import { BellNodesService } from './data/bell-nodes.service';
import { EorzeanTimeService } from './time/eorzean-time.service';
import { TimerPipe } from './time/timer.pipe';
import { HtmlToolsService } from './tools/html-tools.service';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { LinkToolsService } from './tools/link-tools.service';
import { CharacterService } from './api/character.service';
import { DiscordWebhookService } from './discord/discord-webhook.service';
import { ListItemCommentNotification } from '../model/notification/list-item-comment-notification';
import { MaintenanceModule } from '../pages/maintenance/maintenance.module';
import { PatreonService } from './patreon/patreon.service';
import { CustomLink } from './database/custom-links/custom-link';
import { ListTemplate } from './database/custom-links/list-template';


@NgModule({
  imports: [
    HttpClientModule,
    NgSerializerModule.forChild([
      {
        parent: AbstractNotification,
        children: {
          LIST_COMMENT: ListCommentNotification,
          LIST_ITEM_COMMENT: ListItemCommentNotification
        }
      },
      {
        parent: CustomLink,
        children: {
          link: CustomLink,
          template: ListTemplate
        }
      }
    ]),
    TranslateModule,
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    PushNotificationsModule,
    MaintenanceModule
  ],
  providers: [
    UserService,
    PendingChangesService,
    PlatformService,
    DataService,
    MathToolsService,
    I18nToolsService,
    BellNodesService,
    HtmlToolsService,
    LinkToolsService,
    DiscordWebhookService,
    PatreonService
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
    MaintenanceModule,
    TimerPipe
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        GarlandToolsService,
        EorzeanTimeService,
        CharacterService,
        IpcService,
        LocalizedDataService
      ]
    };
  }
}
