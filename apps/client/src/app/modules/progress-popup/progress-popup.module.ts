import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressPopupComponent } from './progress-popup/progress-popup.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ProgressPopupService } from './progress-popup.service';

@NgModule({
  imports: [
    CommonModule,

    NgZorroAntdModule
  ],
  providers: [
    ProgressPopupService
  ],
  declarations: [ProgressPopupComponent],
  entryComponents: [ProgressPopupComponent]
})
export class ProgressPopupModule {
}
