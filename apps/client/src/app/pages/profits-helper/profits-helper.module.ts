import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfitsHelperComponent } from './profits-helper/profits-helper.component';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { ListModule } from '../../modules/list/list.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { MarketboardModule } from '../../modules/marketboard/marketboard.module';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';


const routes: Routes = [
  {
    path: '',
    component: ProfitsHelperComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [ProfitsHelperComponent],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PipesModule,
    CoreModule,
    ListModule,
    FlexLayoutModule,
    FullpageMessageModule,

    RouterModule.forChild(routes),
    ItemIconModule,
    MarketboardModule,
    NzCardModule,
    NzTableModule,
    NzSpinModule,
    NzCheckboxModule,
    NzEmptyModule,
    NzGridModule,
    NzInputNumberModule
  ]
})
export class ProfitsHelperModule {
}
