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
import { AntdSharedModule } from '../../core/antd-shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    FlexLayoutModule,
    AntdSharedModule,
    ItemIconModule,
    TranslateModule,
    FormsModule,
    PipesModule,
    RouterModule
  ],
  declarations: [ItemPickerComponent],
  providers: [
    ItemPickerService
  ]
})
export class ItemPickerModule {
}
