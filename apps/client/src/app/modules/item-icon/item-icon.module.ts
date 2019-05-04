import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemIconComponent } from './item-icon/item-icon.component';
import { SettingsModule } from '../settings/settings.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    SettingsModule,
    RouterModule,

    TooltipModule
  ],
  declarations: [ItemIconComponent],
  exports: [ItemIconComponent]
})
export class ItemIconModule {
}
