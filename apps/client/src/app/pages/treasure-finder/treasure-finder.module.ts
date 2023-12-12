import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreasureFinderComponent } from './treasure-finder/treasure-finder.component';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';

import { TranslateModule } from '@ngx-translate/core';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { MapModule } from '../../modules/map/map.module';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';


const routes: Routes = [
  {
    path: '',
    component: TreasureFinderComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
    imports: [
    CommonModule,
    CoreModule,
    FlexLayoutModule,
    FormsModule,
    PipesModule,
    TranslateModule,
    FullpageMessageModule,
    RouterModule.forChild(routes),
    NzSelectModule,
    NzSpinModule,
    MapModule,
    NzDividerModule,
    NzGridModule,
    NzFormModule,
    TreasureFinderComponent
]
})
export class TreasureFinderModule {
}
