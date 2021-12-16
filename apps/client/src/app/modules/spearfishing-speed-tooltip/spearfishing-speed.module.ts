import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpearfishingSpeedComponent } from './spearfishing-speed/spearfishing-speed.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';


@NgModule({
  declarations: [
    SpearfishingSpeedComponent
  ],
  exports: [
    SpearfishingSpeedComponent
  ],
  imports: [
    CommonModule,
    NzToolTipModule,
    NzIconModule,
    NzPopoverModule
  ]
})
export class SpearfishingSpeedModule {
}
