import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeFinderComponent } from './recipe-finder/recipe-finder.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { ListModule } from '../../modules/list/list.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { MarketboardModule } from '../../modules/marketboard/marketboard.module';
import { ClipboardImportPopupComponent } from './clipboard-import-popup/clipboard-import-popup.component';
import { InventoryImportPopupComponent } from './inventory-import-popup/inventory-import-popup.component';

import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

const routes: Routes = [
  {
    path: '',
    component: RecipeFinderComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard],
    data: {
      title: 'TITLE.Recipe_Finder'
    }
  }
];

@NgModule({
    imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PipesModule,
    CoreModule,
    ListModule,
    FlexLayoutModule,
    FullpageMessageModule,
    RouterModule.forChild(routes),
    ItemIconModule,
    MarketboardModule,
    NzPaginationModule,
    NzToolTipModule,
    RecipeFinderComponent, ClipboardImportPopupComponent, InventoryImportPopupComponent
]
})
export class RecipeFinderModule {
}
