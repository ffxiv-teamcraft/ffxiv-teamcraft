import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FishingBaitComponent } from './fishing-bait/fishing-bait.component';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ItemIconModule } from '../item-icon/item-icon.module';
import { PipesModule } from '../../pipes/pipes.module';
import { TooltipModule } from '../tooltip/tooltip.module';


@NgModule({
    imports: [
    CommonModule,
    CoreModule,
    FlexLayoutModule,
    ItemIconModule,
    PipesModule,
    TooltipModule,
    FishingBaitComponent
],
    exports: [FishingBaitComponent]
})
export class FishingBaitModule {
}
