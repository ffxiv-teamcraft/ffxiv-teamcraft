import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolderAdditionPickerComponent } from './folder-addition-picker/folder-addition-picker.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AntdSharedModule } from '../../core/antd-shared.module';

@NgModule({
  declarations: [FolderAdditionPickerComponent],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,

    AntdSharedModule
  ]
})
export class FolderAdditionPickerModule {
}
