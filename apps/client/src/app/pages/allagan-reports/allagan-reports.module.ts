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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzInputModule } from 'ng-zorro-antd/input';
import { AllaganReportRowComponent } from './allagan-report-row/allagan-report-row.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { LazyScrollModule } from '../../modules/lazy-scroll/lazy-scroll.module';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { PredatorsInputComponent } from './predators-input/predators-input.component';
import { ItemContextService } from '../db/service/item-context.service';
import { FishDataService } from '../db/service/fish-data.service';
import { FishContextService } from '../db/service/fish-context.service';
import * as FishGQLProviders from '../db/service/fish-data.gql';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { ReportsManagementComponent } from './reports-management.component';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { ReportSourceDisplayComponent } from './report-source-display/report-source-display.component';
import { ReportSourceCompactDetailsComponent } from './report-source-compact-details/report-source-compact-details.component';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { QuickSearchModule } from '../../modules/quick-search/quick-search.module';
import { ApolloClientResolver } from '../../core/apollo-client.resolver';
import { SpearfishingSpeedModule } from '../../modules/spearfishing-speed-tooltip/spearfishing-speed.module';


const routes: Routes = [
  {
    path: '',
    component: AllaganReportsComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard],
    resolve: {
      client: ApolloClientResolver
    }
  },
  {
    path: ':itemId',
    component: AllaganReportDetailsComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard],
    resolve: {
      client: ApolloClientResolver
    }
  }
];

@NgModule({
  declarations: [AllaganReportsComponent,
    AllaganReportDetailsComponent,
    AllaganReportRowComponent,
    PredatorsInputComponent,
    ReportsManagementComponent,
    ReportSourceDisplayComponent,
    ReportSourceCompactDetailsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ItemIconModule,
    FlexLayoutModule,
    CoreModule,
    PipesModule,
    NzDividerModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzSelectModule,
    NzAutocompleteModule,
    NzInputModule,
    NzEmptyModule,
    NzTagModule,
    NzAvatarModule,
    NzPopconfirmModule,
    LazyScrollModule,
    NzInputNumberModule,
    NzSpinModule,
    NzAlertModule,
    PageLoaderModule,
    NzUploadModule,
    NzProgressModule,
    NzCardModule,
    NzStatisticModule,
    NzCheckboxModule,
    QuickSearchModule,
    SpearfishingSpeedModule
  ],
  providers: [
    ...Object.values(AllaganReportsGQLProviders),
    ItemContextService,
    FishDataService,
    FishContextService,
    ...Object.values(FishGQLProviders)
  ]
})
export class AllaganReportsModule {
}
