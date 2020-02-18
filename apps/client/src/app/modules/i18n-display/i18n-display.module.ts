import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nDisplayComponent } from './i18n-display/i18n-display.component';
import { RouterModule } from '@angular/router';
import { TooltipModule } from '../tooltip/tooltip.module';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    TooltipModule
  ],
  declarations: [I18nDisplayComponent],
  exports: [I18nDisplayComponent]
})
export class I18nDisplayModule {
}
