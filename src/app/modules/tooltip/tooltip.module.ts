import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TooltipComponent} from './tooltip.component';
import {TooltipDataService} from './tooltip-data.service';
import {HttpClientModule} from '@angular/common/http';
import {OverlayModule} from '@angular/cdk/overlay';
import { XivdbTooltipComponent } from './xivdb-tooltip/xivdb-tooltip.component';
import { XivdbTooltipDirective } from './xivdb-tooltip/xivdb-tooltip.directive';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        OverlayModule,
    ],
    declarations: [TooltipComponent, XivdbTooltipComponent, XivdbTooltipDirective],
    exports: [TooltipComponent, XivdbTooltipDirective],
    entryComponents: [XivdbTooltipComponent],
    providers: [TooltipDataService]
})
export class TooltipModule {
}
