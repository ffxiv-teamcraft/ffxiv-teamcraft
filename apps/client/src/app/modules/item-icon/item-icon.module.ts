import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemIconComponent } from './item-icon/item-icon.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ItemIconComponent],
  exports: [ItemIconComponent]
})
export class ItemIconModule {
}
