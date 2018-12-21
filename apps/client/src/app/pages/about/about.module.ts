import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about/about.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';

const routes: Routes = [
  {
    path: '',
    component: AboutComponent,
    canActivate: [MaintenanceGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,

    RouterModule.forChild(routes)
  ],
  declarations: [AboutComponent]
})
export class AboutModule {
}
