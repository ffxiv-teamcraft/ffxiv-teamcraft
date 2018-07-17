import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NotificationsComponent} from './notifications/notifications.component';
import {RouterModule, Routes} from '@angular/router';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';
import {TranslateModule} from '@ngx-translate/core';
import {CoreModule} from '../../core/core.module';
import {MatButtonModule, MatIconModule, MatListModule, MatProgressSpinnerModule} from '@angular/material';

const routes: Routes = [{
    path: '',
    component: NotificationsComponent,
    canActivate: [MaintenanceGuard]
}];


@NgModule({
    imports: [
        CommonModule,

        TranslateModule,
        CoreModule,

        RouterModule.forChild(routes),

        MatProgressSpinnerModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
    ],
    declarations: [NotificationsComponent]
})
export class NotificationsModule {
}
