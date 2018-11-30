import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsPopupComponent } from './settings-popup/settings-popup.component';
import { SettingsService } from './settings.service';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsPopupService } from './settings-popup.service';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    NgZorroAntdModule,
    TranslateModule,
    FormsModule
  ],
  declarations: [
    SettingsPopupComponent
  ],
  entryComponents: [
    SettingsPopupComponent
  ],
  providers: [
    SettingsService,
    SettingsPopupService
  ]
})
export class SettingsModule {
}
