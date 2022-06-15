import { ErrorHandler, ModuleWithProviders, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { GarlandToolsService } from './api/garland-tools.service';
import { DataService } from './api/data.service';
import { NgSerializerModule } from '@kaiu/ng-serializer';
import { I18nPipe } from './i18n.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { PushNotificationsModule } from 'ng-push-ivy';
import { AbstractNotification } from './notification/abstract-notification';
import { ListCommentNotification } from '../model/notification/list-comment-notification';
import { PendingChangesService } from './database/pending-changes/pending-changes.service';
import { PlatformService } from './tools/platform.service';
import { MathToolsService } from './tools/math-tools';
import { EorzeanTimeService } from './eorzea/eorzean-time.service';
import { TimerPipe } from './eorzea/timer.pipe';
import { HtmlToolsService } from './tools/html-tools.service';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { LinkToolsService } from './tools/link-tools.service';
import { DiscordWebhookService } from './discord/discord-webhook.service';
import { ListItemCommentNotification } from '../model/notification/list-item-comment-notification';
import { MaintenanceModule } from '../pages/maintenance/maintenance.module';
import { PatreonService } from './patreon/patreon.service';
import { CustomLink } from './database/custom-links/custom-link';
import { ListTemplate } from './database/custom-links/list-template';
import { WeatherService } from './eorzea/weather.service';
import { DbButtonComponent } from './db-button/db-button.component';
import { RouterModule } from '@angular/router';
import { ItemRarityDirective } from './item-rarity/item-rarity.directive';
import { DbItemCommentNotification } from '../model/notification/db-item-comment-notification';
import { DbCommentReplyNotification } from '../model/notification/db-comment-reply-notification';
import { AdminGuard } from './guard/admin.guard';
import { ErrorInterceptor } from './interceptor/error-interceptor';
import { TeamcraftErrorHandler } from './error-handler/teamcraft-error-handler';
import { DevGuard } from './guard/dev.guard';
import { DATA_REPORTERS } from './data-reporting/data-reporters-index';
import { VersionLockModule } from '../pages/version-lock/version-lock.module';
import { LazyComponentDirective } from './tools/lazy-component';
import { TutorialModule } from './tutorial/tutorial.module';
import { ModeratorGuard } from './guard/moderator.guard';
import { MouseWheelDirective } from './event/mouse-wheel/mouse-wheel.directive';
import { SupportUsPopupComponent } from './patreon/support-us-popup/support-us-popup.component';
import { ClipboardDirective } from './clipboard.directive';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';
import { CommissionNotification } from '../model/notification/commission-notification';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { IpcPopupsModule } from '../modules/ipc-popups/ipc-popups.module';
import { ItemNameClipboardDirective } from './item-name-clipboard.directive';
import { I18nNameComponent } from './i18n/i18n-name/i18n-name.component';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { CommonModule } from '@angular/common';
import { I18nRowPipe } from './i18n/i18n-row.pipe';
import { NzNotificationModule } from 'ng-zorro-antd/notification';


@NgModule({
  imports: [
    CommonModule,
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
          COMMISSION: CommissionNotification
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
    AngularFireFunctionsModule,
    PushNotificationsModule,
    MaintenanceModule,
    VersionLockModule,
    RouterModule,
    TutorialModule,
    ClipboardModule,
    IpcPopupsModule,

    NzButtonModule,
    NzToolTipModule,
    NzIconModule,
    NzDividerModule,
    NzModalModule,
    NzSkeletonModule,
    NzNotificationModule
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
    ClipboardDirective,
    ItemNameClipboardDirective,
    I18nNameComponent,
    I18nRowPipe
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
    ClipboardDirective,
    ItemNameClipboardDirective,
    I18nNameComponent,

    NzButtonModule,
    NzToolTipModule,
    NzIconModule,
    I18nRowPipe
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        GarlandToolsService,
        EorzeanTimeService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
      ]
    };
  }
}
