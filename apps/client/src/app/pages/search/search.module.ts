import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ListModule } from '../../modules/list/list.module';
import { ListPickerModule } from '../../modules/list-picker/list-picker.module';
import { ProgressPopupModule } from '../../modules/progress-popup/progress-popup.module';
import { SettingsModule } from '../../modules/settings/settings.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MarketboardModule } from '../../modules/marketboard/marketboard.module';
import { RotationsModule } from '../../modules/rotations/rotations.module';
import { SearchIntroComponent } from './search-intro/search-intro.component';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { ClipboardModule } from 'ngx-clipboard';
import { SearchResultComponent } from './search-result/search-result.component';

const routes: Routes = [
  {
    path: '',
    component: SearchComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    ClipboardModule,

    CoreModule,
    ListModule,
    TranslateModule,
    FullpageMessageModule,
    PageLoaderModule,
    PipesModule,
    SettingsModule,
    ListPickerModule,
    ProgressPopupModule,
    MarketboardModule,
    RotationsModule,
    ItemIconModule,

    NgZorroAntdModule,

    RouterModule.forChild(routes)
  ],
  declarations: [SearchComponent, SearchIntroComponent, SearchResultComponent]
})
export class SearchModule {
}
