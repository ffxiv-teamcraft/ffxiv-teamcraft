import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolderAdditionPickerComponent } from './folder-addition-picker/folder-addition-picker.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';

@NgModule({
  declarations: [FolderAdditionPickerComponent],
  entryComponents: [FolderAdditionPickerComponent],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,

    NgZorroAntdModule
  ]
})
export class FolderAdditionPickerModule {
}
