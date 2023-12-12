import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from './maintenance.guard';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';

const routes: Routes = [{
  path: 'maintenance',
  component: MaintenanceComponent
}];

@NgModule({
    imports: [
        CommonModule,
        FullpageMessageModule,
        RouterModule.forChild(routes),
        MaintenanceComponent
    ],
    providers: [
        MaintenanceGuard
    ]
})
export class MaintenanceModule {
}
