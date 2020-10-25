import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsComponent } from './metrics/metrics.component';
import { PlayerMetricsModule } from '../../modules/player-metrics/player-metrics.module';
import { RouterModule, Routes } from '@angular/router';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { TutorialModule } from '../../core/tutorial/tutorial.module';
import { CoreModule } from '../../core/core.module';

const routes: Routes = [
  {
    path: '',
    component: MetricsComponent,
    canActivate: [VersionLockGuard]
  }
];

@NgModule({
  declarations: [
    MetricsComponent
  ],
  imports: [
    CoreModule,
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    PlayerMetricsModule,

    RouterModule.forChild(routes),
    NzCardModule,
    NzDatePickerModule,
    NzButtonModule,
    NzIconModule,
    TranslateModule,
    NzPopconfirmModule,
    DragDropModule,
    NzToolTipModule,
    NzSelectModule,
    NzInputModule,

    TutorialModule,
    NzAlertModule
  ]
})
export class MetricsModule {
}
