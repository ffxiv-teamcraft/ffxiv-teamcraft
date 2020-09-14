import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CraftingReplaysComponent } from './crafting-replays/crafting-replays.component';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { CraftingReplayModule } from '../../modules/crafting-replay/crafting-replay.module';
import { SimulatorModule } from '../simulator/simulator.module';
import { NzAlertModule, NzButtonModule, NzDividerModule, NzIconModule, NzMessageModule, NzPopconfirmModule } from 'ng-zorro-antd';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';


const routes: Routes = [
  {
    path: '',
    component: CraftingReplaysComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [
    CraftingReplaysComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,

    RouterModule.forChild(routes),

    FullpageMessageModule,
    CraftingReplayModule,
    FlexLayoutModule,
    PageLoaderModule,
    SimulatorModule,
    NzAlertModule,
    ItemIconModule,
    PipesModule,
    CoreModule,
    NzDividerModule,
    NzButtonModule,
    NzIconModule,
    NzPopconfirmModule,
    NzMessageModule
  ]
})
export class CraftingReplaysModule {
}
