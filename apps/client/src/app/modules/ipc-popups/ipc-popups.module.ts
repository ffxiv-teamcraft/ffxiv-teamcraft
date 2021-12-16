import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NpcapInstallPopupComponent } from './npcap-install-popup/npcap-install-popup.component';
import { RawsockAdminErrorPopupComponent } from './rawsock-admin-error-popup/rawsock-admin-error-popup.component';
import { TranslateModule } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { UpdateInstallPopupComponent } from './update-install-popup/update-install-popup.component';


@NgModule({
  declarations: [NpcapInstallPopupComponent, RawsockAdminErrorPopupComponent, UpdateInstallPopupComponent],
  imports: [
    CommonModule,
    TranslateModule,
    NzButtonModule,
    FlexModule,
    NzDividerModule
  ]
})
export class IpcPopupsModule {
}
