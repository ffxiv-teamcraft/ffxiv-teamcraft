import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {LinkComponent} from './link/link.component';
import {CoreModule} from '../../core/core.module';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';

const routes: Routes = [{
    path: 'link/:nickName/:uri',
    component: LinkComponent,
    canActivate: [MaintenanceGuard]
}];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        CoreModule,
    ],
    declarations: [
        LinkComponent,
    ]
})
export class LinkModule {
}
