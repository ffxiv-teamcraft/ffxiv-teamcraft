import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdComponent } from './ad/ad.component';



@NgModule({
  declarations: [AdComponent],
  exports: [AdComponent],
  imports: [
    CommonModule
  ]
})
export class AdsModule { }
