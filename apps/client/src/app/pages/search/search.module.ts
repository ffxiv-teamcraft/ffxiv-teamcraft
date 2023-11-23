import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';

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

import { SearchResultComponent } from './search-result/search-result.component';

import { CompanyWorkshopTreeModule } from '../../modules/company-workshop-tree/company-workshop-tree.module';
import { SearchJobPickerComponent } from './search-job-picker/search-job-picker.component';

import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { ItemDetailsBoxComponent } from './item-details-box/item-details-box.component';
import { TooltipModule } from '../../modules/tooltip/tooltip.module';
import { NzRadioModule } from 'ng-zorro-antd/radio';

const routes: Routes = [
  {
    path: '',
    component: SearchComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard],
  },
];

@NgModule({
    imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CoreModule,
    ListModule,
    TranslateModule,
    FullpageMessageModule,
    PipesModule,
    SettingsModule,
    ListPickerModule,
    ProgressPopupModule,
    MarketboardModule,
    RotationsModule,
    ItemIconModule,
    RouterModule.forChild(routes),
    CompanyWorkshopTreeModule,
    NzTypographyModule,
    NzPaginationModule,
    TooltipModule,
    NzRadioModule,
    SearchComponent, SearchIntroComponent, SearchResultComponent, SearchJobPickerComponent, ItemDetailsBoxComponent
],
})
export class SearchModule {}
