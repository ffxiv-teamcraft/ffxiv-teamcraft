import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MappyComponent } from './mappy/mappy.component';
import { RouterModule, Routes } from '@angular/router';
import { MapModule } from '../../modules/map/map.module';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { MappyDashboardComponent } from './mappy-dashboard/mappy-dashboard.component';
import { MappyGuard } from './mappy.guard';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    component: MappyDashboardComponent,
    canLoad: [MappyGuard]
  },
  {
    path: ':mapId',
    component: MappyComponent,
    canLoad: [MappyGuard]
  }
];

@NgModule({
  declarations: [MappyComponent, MappyDashboardComponent],
  imports: [
    CommonModule,
    MapModule,
    FlexLayoutModule,
    FormsModule,

    RouterModule.forChild(routes),
    NzDividerModule,
    PipesModule,
    CoreModule,
    NzStatisticModule,
    PageLoaderModule,
    NzButtonModule,
    NzPopconfirmModule,
    NzTagModule,
    NzCardModule,
    NzEmptyModule,
    NzSwitchModule
  ]
})
export class MappyModule {
}
