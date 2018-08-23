import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipComponent } from './tooltip.component';
import { TooltipDataService } from './tooltip-data.service';
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { XivdbTooltipComponent } from './xivdb-tooltip/xivdb-tooltip.component';
import { XivdbTooltipDirective } from './xivdb-tooltip/xivdb-tooltip.directive';
import { XivdbActionTooltipDirective } from './xivdb-tooltip/xivdb-action-tooltip.directive';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    OverlayModule
  ],
  declarations: [TooltipComponent, XivdbTooltipComponent, XivdbTooltipDirective, XivdbActionTooltipDirective],
  exports: [TooltipComponent, XivdbTooltipDirective, XivdbActionTooltipDirective],
  entryComponents: [XivdbTooltipComponent],
  providers: [TooltipDataService]
})
export class TooltipModule {
}
