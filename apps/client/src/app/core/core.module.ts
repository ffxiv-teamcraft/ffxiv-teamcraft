import { ClipboardModule } from '@angular/cdk/clipboard';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, ModuleWithProviders, NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { RouterModule } from '@angular/router';
import { NgSerializerModule } from '@kaiu/ng-serializer';
import { TranslateModule } from '@ngx-translate/core';
import { PushNotificationsModule } from 'ng-push';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { BlogPostNotification } from '../model/notification/blog-post-notification';
import { DbCommentReplyNotification } from '../model/notification/db-comment-reply-notification';
import { DbItemCommentNotification } from '../model/notification/db-item-comment-notification';
import { ListCommentNotification } from '../model/notification/list-comment-notification';
import { ListItemCommentNotification } from '../model/notification/list-item-comment-notification';
import { ListRowSerializationHelper } from '../modules/list/data/list-row-serialization-helper.service';
import { MaintenanceModule } from '../pages/maintenance/maintenance.module';
import { VersionLockModule } from '../pages/version-lock/version-lock.module';
import { CharacterService } from './api/character.service';
import { DataService } from './api/data.service';
import { GarlandToolsService } from './api/garland-tools.service';
import { ClipboardDirective } from './clipboard.directive';
import { DATA_REPORTERS } from './data-reporting/data-reporters-index';
import { LocalizedDataService } from './data/localized-data.service';
import { CustomLink } from './database/custom-links/custom-link';
import { ListTemplate } from './database/custom-links/list-template';
import { PendingChangesService } from './database/pending-changes/pending-changes.service';
import { DbButtonComponent } from './db-button/db-button.component';
import { DiscordWebhookService } from './discord/discord-webhook.service';
import { EorzeanTimeService } from './eorzea/eorzean-time.service';
import { TimerPipe } from './eorzea/timer.pipe';
import { WeatherService } from './eorzea/weather.service';
import { TeamcraftErrorHandler } from './error-handler/teamcraft-error-handler';
import { MouseWheelDirective } from './event/mouse-wheel/mouse-wheel.directive';
import { AdminGuard } from './guard/admin.guard';
import { DevGuard } from './guard/dev.guard';
import { ModeratorGuard } from './guard/moderator.guard';
import { I18nPipe } from './i18n.pipe';
import { ErrorInterceptor } from './interceptor/error-interceptor';
import { ItemRarityDirective } from './item-rarity/item-rarity.directive';
import { AbstractNotification } from './notification/abstract-notification';
import { PatreonService } from './patreon/patreon.service';
import { SupportUsPopupComponent } from './patreon/support-us-popup/support-us-popup.component';
import { HtmlToolsService } from './tools/html-tools.service';
import { LazyComponentDirective } from './tools/lazy-component';
import { LinkToolsService } from './tools/link-tools.service';
import { MathToolsService } from './tools/math-tools';
import { PlatformService } from './tools/platform.service';
import { TutorialModule } from './tutorial/tutorial.module';

@NgModule({
  imports: [
    TranslateModule,
    HttpClientModule,
    NgSerializerModule.forChild([
      {
        parent: AbstractNotification,
        children: {
          LIST_COMMENT: ListCommentNotification,
          LIST_ITEM_COMMENT: ListItemCommentNotification,
          DB_ITEM_COMMENT: DbItemCommentNotification,
          DB_COMMENT_REPLY: DbCommentReplyNotification,
          BLOG_POST: BlogPostNotification
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
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    PushNotificationsModule,
    MaintenanceModule,
    VersionLockModule,
    NgZorroAntdModule,
    RouterModule,
    TutorialModule,
    ClipboardModule
  ],
  providers: [
    PendingChangesService,
    PlatformService,
    DataService,
    MathToolsService,
    HtmlToolsService,
    LinkToolsService,
    DiscordWebhookService,
    PatreonService,
    WeatherService,
    AdminGuard,
    ModeratorGuard,
    DevGuard,
    ...DATA_REPORTERS,
    { provide: ErrorHandler, useClass: TeamcraftErrorHandler }
  ],
  declarations: [
    I18nPipe,
    TimerPipe,
    DbButtonComponent,
    ItemRarityDirective,
    LazyComponentDirective,
    MouseWheelDirective,
    SupportUsPopupComponent,
    ClipboardDirective
  ],
  exports: [
    I18nPipe,
    TranslateModule,
    AngularFireModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    PushNotificationsModule,
    MaintenanceModule,
    TimerPipe,
    DbButtonComponent,
    ItemRarityDirective,
    LazyComponentDirective,
    TutorialModule,
    MouseWheelDirective,
    ClipboardDirective
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        GarlandToolsService,
        EorzeanTimeService,
        CharacterService,
        LocalizedDataService,
        ListRowSerializationHelper,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
      ]
    };
  }
}
