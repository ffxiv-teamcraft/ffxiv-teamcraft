import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from './maintenance.guard';

const routes: Routes = [{
  path: 'maintenance',
  component: MaintenanceComponent
}];

@NgModule({
  imports: [
    CommonModule,

    RouterModule.forChild(routes)
  ],
  declarations: [
    MaintenanceComponent
  ],
  providers: [
    MaintenanceGuard
  ]
})
export class MaintenanceModule {
}
