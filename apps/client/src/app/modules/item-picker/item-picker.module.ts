import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemPickerComponent } from './item-picker/item-picker.component';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ItemIconModule } from '../item-icon/item-icon.module';
import { ItemPickerService } from './item-picker.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';

import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';


@NgModule({
    imports: [
    CommonModule,
    CoreModule,
    FlexLayoutModule,
    ItemIconModule,
    TranslateModule,
    FormsModule,
    PipesModule,
    RouterModule,
    ScrollingModule,
    ItemPickerComponent
],
    providers: [
        ItemPickerService
    ]
})
export class ItemPickerModule {
}
