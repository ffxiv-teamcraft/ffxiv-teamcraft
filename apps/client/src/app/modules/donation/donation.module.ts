import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DonationButtonComponent } from './donation-button/donation-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule
  ],
  declarations: [
    DonationButtonComponent
  ],
  exports: [
    DonationButtonComponent
  ]
})
export class DonationModule {
}
