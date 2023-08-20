import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolderAdditionPickerComponent } from './folder-addition-picker/folder-addition-picker.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { LazyScrollModule } from '../lazy-scroll/lazy-scroll.module';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';

@NgModule({
  declarations: [FolderAdditionPickerComponent],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,

    NzCheckboxModule,
    NzButtonModule,
    ScrollingModule,
    LazyScrollModule
  ]
})
export class FolderAdditionPickerModule {
}
