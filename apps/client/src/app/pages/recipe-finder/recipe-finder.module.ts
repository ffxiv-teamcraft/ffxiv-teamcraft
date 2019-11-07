import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeFinderComponent } from './recipe-finder/recipe-finder.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ClipboardModule } from 'ngx-clipboard';
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

const routes: Routes = [
  {
    path: '',
    component: RecipeFinderComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
  declarations: [RecipeFinderComponent, ClipboardImportPopupComponent],
  entryComponents: [ClipboardImportPopupComponent],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NgZorroAntdModule,
    ClipboardModule,
    PipesModule,
    CoreModule,
    ListModule,
    FlexLayoutModule,
    FullpageMessageModule,
    ClipboardModule,

    RouterModule.forChild(routes),
    ItemIconModule,
    MarketboardModule
  ]
})
export class RecipeFinderModule {
}
