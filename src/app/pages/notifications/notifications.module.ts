import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NotificationsComponent} from './notifications/notifications.component';
import {RouterModule, Routes} from '@angular/router';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';
import {TranslateModule} from '@ngx-translate/core';
import {CoreModule} from '../../core/core.module';
import {MatButtonModule, MatIconModule, MatListModule, MatProgressSpinnerModule, MatSlideToggleModule} from '@angular/material';
import {SettingsModule} from '../settings/settings.module';
import {FormsModule} from '@angular/forms';

const routes: Routes = [{
    path: '',
    component: NotificationsComponent,
    canActivate: [MaintenanceGuard]
}];


@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        TranslateModule,
        CoreModule,

        RouterModule.forChild(routes),

        MatProgressSpinnerModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatSlideToggleModule,

        SettingsModule,
    ],
    declarations: [NotificationsComponent]
})
export class NotificationsModule {
}
