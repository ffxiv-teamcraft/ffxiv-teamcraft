import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemIconComponent } from './item-icon/item-icon.component';
import { SettingsModule } from '../settings/settings.module';

@NgModule({
  imports: [
    CommonModule,
    SettingsModule
  ],
  declarations: [ItemIconComponent],
  exports: [ItemIconComponent]
})
export class ItemIconModule {
}
