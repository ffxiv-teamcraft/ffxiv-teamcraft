import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemPickerComponent } from './item-picker/item-picker.component';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ItemIconModule } from '../item-icon/item-icon.module';
import { ItemPickerService } from './item-picker.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    FlexLayoutModule,
    NgZorroAntdModule,
    ItemIconModule,
    TranslateModule,
    FormsModule,
    PipesModule
  ],
  declarations: [ItemPickerComponent],
  entryComponents: [ItemPickerComponent],
  providers: [
    ItemPickerService
  ]
})
export class ItemPickerModule {
}
