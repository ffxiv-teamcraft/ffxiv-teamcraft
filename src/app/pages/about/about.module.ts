import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AboutComponent} from './about/about.component';
import {RouterModule, Routes} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';

const routes: Routes = [
    {
        path: '',
        component: AboutComponent
    }
];

@NgModule({
    imports: [
        CommonModule,

        RouterModule.forChild(routes),

        TranslateModule,
    ],
    declarations: [AboutComponent]
})
export class AboutModule {
}
