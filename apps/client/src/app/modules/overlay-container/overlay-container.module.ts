import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayContainerComponent } from './overlay-container/overlay-container.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { NzSliderModule } from 'ng-zorro-antd/slider';

@NgModule({
    exports: [OverlayContainerComponent],
    imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    TranslateModule,
    CoreModule,
    NzSliderModule,
    OverlayContainerComponent
]
})
export class OverlayContainerModule {
}
