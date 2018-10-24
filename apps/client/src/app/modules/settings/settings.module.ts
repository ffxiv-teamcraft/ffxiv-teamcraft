import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsPopupComponent } from './settings-popup/settings-popup.component';
import { SettingsService } from './settings.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SettingsPopupComponent
  ],
  entryComponents: [
    SettingsPopupComponent
  ],
  providers: [
    SettingsService
  ]
})
export class SettingsModule {
}
