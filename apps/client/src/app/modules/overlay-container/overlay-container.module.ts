import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayContainerComponent } from './overlay-container/overlay-container.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AntdSharedModule } from '../../core/antd-shared.module';

@NgModule({
  declarations: [OverlayContainerComponent],
  exports: [OverlayContainerComponent],
  imports: [
    CommonModule,
    AntdSharedModule,
    FormsModule,
    FlexLayoutModule,
    TranslateModule,
    CoreModule
  ]
})
export class OverlayContainerModule {
}
