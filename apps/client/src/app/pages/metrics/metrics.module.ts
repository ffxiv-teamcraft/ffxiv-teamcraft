import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsComponent } from './metrics/metrics.component';
import { PlayerMetricsModule } from '../../modules/player-metrics/player-metrics.module';
import { RouterModule, Routes } from '@angular/router';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import {
  NzButtonModule,
  NzCardModule,
  NzDatePickerModule,
  NzIconModule,
  NzInputModule,
  NzPopconfirmModule,
  NzSelectModule,
  NzToolTipModule
} from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { TutorialModule } from '../../core/tutorial/tutorial.module';

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
    ClipboardModule,
    TutorialModule
  ]
})
export class MetricsModule {
}
