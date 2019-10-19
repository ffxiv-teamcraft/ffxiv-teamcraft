import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionsBoxComponent } from './permissions-box/permissions-box.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgZorroAntdModule, NzListModule } from 'ng-zorro-antd';
import { PageLoaderModule } from '../page-loader/page-loader.module';
import { FormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { UserPickerModule } from '../user-picker/user-picker.module';
import { FreecompanyPickerModule } from '../freecompany-picker/freecompany-picker.module';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    TranslateModule,
    NgZorroAntdModule,
    NzListModule,
    FormsModule,

    PipesModule,
    CoreModule,
    PageLoaderModule,
    UserPickerModule,
    FreecompanyPickerModule
  ],
  declarations: [PermissionsBoxComponent],
  entryComponents: [PermissionsBoxComponent],
  exports: [PermissionsBoxComponent]
})
export class PermissionsModule {
}
