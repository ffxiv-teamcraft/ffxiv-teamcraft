import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { FoodPickerComponent } from './food-picker/food-picker.component';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MapModule } from '../../modules/map/map.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { FormsModule } from '@angular/forms';
import { MarketboardModule } from '../../modules/marketboard/marketboard.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';


const routes: Routes = [{
  path: '',
  component: FoodPickerComponent
}];

@NgModule({
    imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    PipesModule,
    FullpageMessageModule,
    MapModule,
    ItemIconModule,
    TranslateModule,
    FlexLayoutModule,
    RouterModule.forChild(routes),
    MarketboardModule,
    FoodPickerComponent
]
})
export class FoodPickerModule {
}
