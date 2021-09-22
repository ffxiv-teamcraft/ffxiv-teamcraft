import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllaganReportsComponent } from './allagan-reports/allagan-reports.component';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { AllaganReportDetailsComponent } from './allagan-report-details/allagan-report-details.component';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import * as AllaganReportsGQLProviders from './allagan-reports.gql';
import { AllaganReportsService } from './allagan-reports.service';
import { FormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzInputModule } from 'ng-zorro-antd/input';
import { AllaganReportRowComponent } from './allagan-report-row/allagan-report-row.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTagModule } from 'ng-zorro-antd/tag';


const routes: Routes = [
  {
    path: '',
    component: AllaganReportsComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  },
  {
    path: ':itemId',
    component: AllaganReportDetailsComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [AllaganReportsComponent, AllaganReportDetailsComponent, AllaganReportRowComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ItemIconModule,
    FlexLayoutModule,
    CoreModule,
    PipesModule,
    NzDividerModule,
    FormsModule,
    NzFormModule,
    NzSelectModule,
    NzAutocompleteModule,
    NzInputModule,
    NzEmptyModule,
    NzTagModule
  ],
  providers: [
    AllaganReportsService, ...Object.values(AllaganReportsGQLProviders)
  ]
})
export class AllaganReportsModule {
}
