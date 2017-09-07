import {ModuleWithProviders, NgModule} from '@angular/core';
import {ListManagerService} from './list/list-manager.service';
import {HtmlToolsService} from './html-tools.service';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
    imports: [
        HttpClientModule
    ]
})
export class CoreModule {

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CoreModule,
            providers: [
                ListManagerService,
                HtmlToolsService
            ]
        };
    }
}
