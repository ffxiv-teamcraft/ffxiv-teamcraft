import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayContainerComponent } from './overlay-container/overlay-container.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [OverlayContainerComponent],
  exports: [OverlayContainerComponent],
  imports: [
    CommonModule,
    NgZorroAntdModule,
    FormsModule,
    FlexLayoutModule,
    TranslateModule,
    CoreModule
  ]
})
export class OverlayContainerModule {
}
