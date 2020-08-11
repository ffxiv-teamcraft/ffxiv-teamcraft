import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemSearchOverlayComponent } from './item-search-overlay/item-search-overlay.component';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { OverlayContainerModule } from '../../modules/overlay-container/overlay-container.module';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { NzAutocompleteModule, NzButtonModule, NzDividerModule, NzInputModule, NzTagModule } from 'ng-zorro-antd';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { ListModule } from '../../modules/list/list.module';
import { MarketboardModule } from '../../modules/marketboard/marketboard.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';

const routes: Routes = [
  {
    path: '',
    component: ItemSearchOverlayComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [ItemSearchOverlayComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    RouterModule.forChild(routes),

    TranslateModule,

    CoreModule,
    OverlayContainerModule,
    FormsModule,
    NzAutocompleteModule,
    NzInputModule,
    PipesModule,
    ItemIconModule,
    NzTagModule,
    NzButtonModule,
    ListModule,
    NzDividerModule,
    MarketboardModule,
    FullpageMessageModule
  ]
})
export class ItemSearchOverlayModule {
}
