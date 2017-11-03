import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TooltipComponent} from './tooltip.component';
import {TooltipDataService} from './tooltip-data.service';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule
    ],
    declarations: [TooltipComponent],
    exports: [TooltipComponent],
    providers: [TooltipDataService]
})
export class TooltipModule {
}
