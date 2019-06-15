import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullpageMessageComponent } from './fullpage-message/fullpage-message.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [FullpageMessageComponent],
  exports: [FullpageMessageComponent]
})
export class FullpageMessageModule {
}
