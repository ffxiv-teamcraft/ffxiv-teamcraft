import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectablesComponent } from './collectables/collectables.component';
import { NzButtonModule, NzCollapseModule, NzFormModule, NzInputModule, NzTabsModule, NzToolTipModule } from 'ng-zorro-antd';
import { PipesModule } from '../../pipes/pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';

const routes: Routes = [
  {
    path: '',
    component: CollectablesComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];


@NgModule({
  imports: [
    CoreModule,
    PipesModule,

    FormsModule,
    ReactiveFormsModule,
    CommonModule,

    FlexLayoutModule,

    NzCollapseModule,
    NzTabsModule,
    NzInputModule,
    NzFormModule,
    NzButtonModule,
    NzToolTipModule,

    RouterModule.forChild(routes)
  ],
  declarations: [
    CollectablesComponent
  ]
})
export class CollectablesModule {
}
