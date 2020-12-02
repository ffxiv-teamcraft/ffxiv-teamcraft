import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressPopupComponent } from './progress-popup/progress-popup.component';
import { ProgressPopupService } from './progress-popup.service';
import { AntdSharedModule } from '../../core/antd-shared.module';

@NgModule({
  imports: [
    CommonModule,

    AntdSharedModule
  ],
  providers: [
    ProgressPopupService
  ],
  declarations: [ProgressPopupComponent]
})
export class ProgressPopupModule {
}
