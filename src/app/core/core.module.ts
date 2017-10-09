import {NgModule} from '@angular/core';
import {ListManagerService} from './list/list-manager.service';
import {HtmlToolsService} from './html-tools.service';
import {HttpClientModule} from '@angular/common/http';
import {GarlandToolsService} from './api/garland-tools.service';
import {I18nToolsService} from './i18n-tools.service';
import {DataService} from './api/data.service';
import {NgSerializerModule} from '@kaiu/ng-serializer';
import {EorzeanTimeService} from './time/eorzean-time.service';

@NgModule({
    imports: [
        HttpClientModule,
        NgSerializerModule
    ],
    providers: [
        GarlandToolsService,
        I18nToolsService,
        DataService,
        ListManagerService,
        HtmlToolsService,
        EorzeanTimeService,
    ]
})
export class CoreModule {
}
