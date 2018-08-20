import {NgModule, Provider} from '@angular/core';
import {HtmlToolsService} from './tools/html-tools.service';
import {HttpClientModule} from '@angular/common/http';
import {GarlandToolsService} from './api/garland-tools.service';
import {DataService} from './api/data.service';
import {NgSerializerModule} from '@kaiu/ng-serializer';
import {I18nPipe} from '../pipes/i18n.pipe';
import {TranslateModule} from '@ngx-translate/core';
import {LocalizedDataService} from './data/localized-data.service';
import {AngularFireModule} from 'angularfire2';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {EXTRACTORS} from './list/data/data-extractor.service';
import {CraftedByExtractor} from './list/data/extractor/crafted-by-extractor';
import {TradeSourcesExtractor} from 'app/core/list/data/extractor/trade-sources-extractor';
import {VendorsExtractor} from './list/data/extractor/vendors-extractor';
import {ReducedFromExtractor} from './list/data/extractor/reduced-from-extractor';
import {DesynthsExtractor} from './list/data/extractor/desynths-extractor';
import {GatheredByExtractor} from './list/data/extractor/gathered-by-extractor';
import {GardeningExtractor} from './list/data/extractor/gardening-extractor';
import {VoyagesExtractor} from './list/data/extractor/voyages-extractor';
import {DropsExtractor} from './list/data/extractor/drops-extractor';
import {InstancesExtractor} from './list/data/extractor/instances-extractor';
import {MatButtonModule, MatDialogModule} from '@angular/material';
import {PushNotificationsModule} from 'ng-push';
import {VenturesExtractor} from './list/data/extractor/ventures-extractor';
import {AbstractNotification} from './notification/abstract-notification';
import {ListProgressNotification} from '../model/notification/list-progress-notification';
import {TeamInviteNotification} from '../model/notification/team-invite-notification';
import {TeamExclusionNotification} from '../model/notification/team-exclusion-notification';
import {ItemAssignedNotification} from '../model/notification/item-assigned-notification';
import {ListCommentNotification} from '../model/notification/list-comment-notification';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import {UserService} from './database/user.service';
import {PendingChangesService} from './database/pending-changes/pending-changes.service';
import {IpcService} from './electron/ipc.service';
import {PlatformService} from './tools/platform.service';


export const DATA_EXTRACTORS: Provider[] = [
    {provide: EXTRACTORS, useClass: CraftedByExtractor, deps: [GarlandToolsService, HtmlToolsService, DataService], multi: true},
    {provide: EXTRACTORS, useClass: GatheredByExtractor, deps: [GarlandToolsService, HtmlToolsService, LocalizedDataService], multi: true},
    {provide: EXTRACTORS, useClass: TradeSourcesExtractor, deps: [DataService], multi: true},
    {provide: EXTRACTORS, useClass: VendorsExtractor, deps: [DataService], multi: true},
    {provide: EXTRACTORS, useClass: ReducedFromExtractor, multi: true},
    {provide: EXTRACTORS, useClass: DesynthsExtractor, multi: true},
    {provide: EXTRACTORS, useClass: InstancesExtractor, multi: true},
    {provide: EXTRACTORS, useClass: GardeningExtractor, multi: true},
    {provide: EXTRACTORS, useClass: VoyagesExtractor, multi: true},
    {provide: EXTRACTORS, useClass: DropsExtractor, multi: true},
    {provide: EXTRACTORS, useClass: VenturesExtractor, multi: true},
];

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
                    LIST_COMMENT: ListCommentNotification,
                }
            }
        ]),
        TranslateModule,
        AngularFirestoreModule,
        AngularFireDatabaseModule,
        MatDialogModule,
        MatButtonModule,
        PushNotificationsModule,
    ],
    providers: [
        UserService,
        PendingChangesService,
        GarlandToolsService,
        IpcService,
        PlatformService
    ],
    declarations: [
        I18nPipe,
    ],
    exports: [
        I18nPipe,
        TranslateModule,
        AngularFireModule,
        AngularFireDatabaseModule,
        AngularFireAuthModule,
        PushNotificationsModule,
    ]
})
export class CoreModule {
}
