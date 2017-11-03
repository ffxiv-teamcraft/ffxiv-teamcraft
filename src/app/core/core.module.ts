import {NgModule} from '@angular/core';
import {ListManagerService} from './list/list-manager.service';
import {HtmlToolsService} from './html-tools.service';
import {HttpClientModule} from '@angular/common/http';
import {GarlandToolsService} from './api/garland-tools.service';
import {I18nToolsService} from './i18n-tools.service';
import {DataService} from './api/data.service';
import {NgSerializerModule} from '@kaiu/ng-serializer';
import {EorzeanTimeService} from './time/eorzean-time.service';
import {I18nPipe} from '../pipes/i18n.pipe';
import {TranslateModule} from '@ngx-translate/core';
import {LocalizedDataService} from './data/localized-data.service';
import {AngularFireModule} from 'angularfire2';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {AngularFireDatabaseModule} from 'angularfire2/database';

@NgModule({
    imports: [
        HttpClientModule,
        NgSerializerModule,
        TranslateModule,
        AngularFireModule,
    ],
    providers: [
        GarlandToolsService,
        I18nToolsService,
        DataService,
        ListManagerService,
        HtmlToolsService,
        EorzeanTimeService,
        LocalizedDataService,
    ],
    declarations: [
        I18nPipe,
    ],
    exports: [
        I18nPipe,
        TranslateModule,
        AngularFireModule,
        AngularFireDatabaseModule,
        AngularFireAuthModule
    ]
})
export class CoreModule {
}
