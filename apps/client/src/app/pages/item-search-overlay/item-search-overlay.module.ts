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
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { ListModule } from '../../modules/list/list.module';
import { MarketboardModule } from '../../modules/marketboard/marketboard.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { InventoryModule } from '../../modules/inventory/inventory.module';

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
    FullpageMessageModule,
    InventoryModule
  ]
})
export class ItemSearchOverlayModule {
}
