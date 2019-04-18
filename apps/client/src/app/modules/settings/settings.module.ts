import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsPopupComponent } from './settings-popup/settings-popup.component';
import { SettingsService } from './settings.service';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsPopupService } from './settings-popup.service';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  imports: [
    CommonModule,
    NgZorroAntdModule,
    FlexLayoutModule,
    TranslateModule,
    FormsModule,
    ColorPickerModule
  ],
  declarations: [
    SettingsPopupComponent
  ],
  entryComponents: [
    SettingsPopupComponent
  ],
  providers: [
    SettingsPopupService
  ]
})
export class SettingsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SettingsModule,
      providers: [
        SettingsService
      ]
    };
  }
}
