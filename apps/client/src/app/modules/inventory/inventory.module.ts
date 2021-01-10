import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { initialState as inventoryInitialState, INVENTORY_FEATURE_KEY, inventoryReducer } from './+state/inventory.reducer';
import { InventoryEffects } from './+state/inventory.effects';
import { CoreModule } from '../../core/core.module';
import { ContentIdLinkingPopupComponent } from './content-id-linking-popup/content-id-linking-popup.component';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { InventoryPositionComponent } from './inventory-position/inventory-position.component';

@NgModule({
  declarations: [ContentIdLinkingPopupComponent, InventoryPositionComponent],
  exports: [
    InventoryPositionComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    StoreModule.forFeature(INVENTORY_FEATURE_KEY, inventoryReducer, {
      initialState: inventoryInitialState
    }),
    EffectsModule.forFeature([InventoryEffects]),
    NzAvatarModule,
    NzDividerModule,
    NzTagModule,
    NzPopconfirmModule,
    NzToolTipModule,
    FlexLayoutModule
  ]
})
export class InventoryModule {
}
