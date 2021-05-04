import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsPopupComponent } from './settings-popup/settings-popup.component';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsPopupService } from './settings-popup.service';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ColorPickerModule } from 'ngx-color-picker';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { AntdSharedModule } from '../../core/antd-shared.module';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzIconModule } from 'ng-zorro-antd/icon';

@NgModule({
  imports: [
    CommonModule,
    AntdSharedModule,
    FlexLayoutModule,
    TranslateModule,
    FormsModule,
    ColorPickerModule,
    PipesModule,
    CoreModule,
    NzSliderModule,
    NzUploadModule,
    NzIconModule
  ],
  declarations: [
    SettingsPopupComponent
  ],
  providers: [
    SettingsPopupService
  ]
})
export class SettingsModule {
  static forRoot(): ModuleWithProviders<SettingsModule> {
    return {
      ngModule: SettingsModule,
      providers: []
    };
  }
}
