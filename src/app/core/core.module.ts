import {ModuleWithProviders, NgModule} from '@angular/core';
import {ListManagerService} from './list/list-manager.service';
import {HtmlToolsService} from './html-tools.service';
import {HttpClientModule} from '@angular/common/http';
import {GarlandToolsService} from './api/garland-tools.service';
import {I18nToolsService} from './i18n-tools.service';
import {DataService} from './api/data.service';

@NgModule({
    imports: [
        HttpClientModule
    ],
    providers: [
        GarlandToolsService,
        I18nToolsService,
        DataService,
        ListManagerService,
        HtmlToolsService
    ]
})
export class CoreModule {
}
