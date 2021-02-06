import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomItemsComponent } from './custom-items/custom-items.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NameQuestionPopupModule } from '../../modules/name-question-popup/name-question-popup.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { CustomItemsModule } from '../../modules/custom-items/custom-items.module';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { FormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { CustomAlarmPopupModule } from '../../modules/custom-alarm-popup/custom-alarm-popup.module';
import { MapModule } from '../../modules/map/map.module';
import { NpcPickerComponent } from './npc-picker/npc-picker.component';
import { ItemPickerModule } from '../../modules/item-picker/item-picker.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { ListPickerModule } from '../../modules/list-picker/list-picker.module';
import { ProgressPopupModule } from '../../modules/progress-popup/progress-popup.module';
import { CustomItemsImportPopupComponent } from './custom-items-import-popup/custom-items-import-popup.component';
import { CustomItemsExportPopupComponent } from './custom-items-export-popup/custom-items-export-popup.component';
import { AntdSharedModule } from '../../core/antd-shared.module';
import { NzUploadModule } from 'ng-zorro-antd/upload';

const routes: Routes = [{
  path: '',
  component: CustomItemsComponent
}];

@NgModule({
  declarations: [CustomItemsComponent, NpcPickerComponent, CustomItemsImportPopupComponent, CustomItemsExportPopupComponent],
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    NgxDnDModule,

    PipesModule,
    NameQuestionPopupModule,
    PageLoaderModule,
    FullpageMessageModule,
    CustomItemsModule,
    CustomAlarmPopupModule,
    MapModule,
    ItemPickerModule,
    ItemIconModule,
    ListPickerModule,
    ProgressPopupModule,

    TranslateModule,
    AntdSharedModule,
    FlexLayoutModule,
    RouterModule.forChild(routes),
    NzUploadModule
  ]
})
export class CustomItemsPageModule {
}
