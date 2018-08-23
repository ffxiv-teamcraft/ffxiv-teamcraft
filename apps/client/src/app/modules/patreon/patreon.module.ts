import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatreonPopupComponent } from './patreon-popup/patreon-popup.component';
import { MatButtonModule, MatDialogModule, MatProgressBarModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { DonationModule } from '../donation/donation.module';

@NgModule({
  imports: [
    CommonModule,

    MatDialogModule,
    MatButtonModule,
    MatProgressBarModule,

    TranslateModule,

    DonationModule
  ],
  declarations: [
    PatreonPopupComponent
  ],
  entryComponents: [
    PatreonPopupComponent
  ]
})
export class PatreonModule {
}
