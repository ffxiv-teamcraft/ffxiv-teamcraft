import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LevelingEquipmentComponent } from './leveling-equipment/leveling-equipment.component';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { PipesModule } from '../../pipes/pipes.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';

const routes: Routes = [
  {
    path: '',
    component: LevelingEquipmentComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [LevelingEquipmentComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TranslateModule,
    CoreModule,

    RouterModule.forChild(routes),
    NzFormModule,
    NzSelectModule,
    NzInputModule,
    PipesModule,
    ReactiveFormsModule,
    NzCheckboxModule,
    NzInputNumberModule,
    ItemIconModule,
    FullpageMessageModule
  ]
})
export class LevelingEquipmentModule {
}
