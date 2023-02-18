import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemIconComponent } from './item-icon/item-icon.component';
import { SettingsModule } from '../settings/settings.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { RouterModule } from '@angular/router';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';

@NgModule({
  imports: [
    CommonModule,
    SettingsModule,
    RouterModule,

    TooltipModule,
    NzSkeletonModule
  ],
  declarations: [ItemIconComponent],
  exports: [ItemIconComponent]
})
export class ItemIconModule {
}
