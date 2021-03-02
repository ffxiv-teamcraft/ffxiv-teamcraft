import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionsBoxComponent } from './permissions-box/permissions-box.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzListModule } from 'ng-zorro-antd/list';
import { PageLoaderModule } from '../page-loader/page-loader.module';
import { FormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { UserPickerModule } from '../user-picker/user-picker.module';
import { FreecompanyPickerModule } from '../freecompany-picker/freecompany-picker.module';
import { AntdSharedModule } from '../../core/antd-shared.module';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    TranslateModule,
    AntdSharedModule,
    NzListModule,
    NzAvatarModule,
    FormsModule,

    PipesModule,
    CoreModule,
    PageLoaderModule,
    UserPickerModule,
    FreecompanyPickerModule
  ],
  declarations: [PermissionsBoxComponent],
  exports: [PermissionsBoxComponent]
})
export class PermissionsModule {
}
