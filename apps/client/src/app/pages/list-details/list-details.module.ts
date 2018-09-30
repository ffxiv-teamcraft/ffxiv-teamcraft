import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListDetailsComponent } from './list-details/list-details.component';
import { ListModule } from '../../modules/list/list.module';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from '../../core/layout/layout.module';
import { ListDetailsPanelComponent } from './list-details-panel/list-details-panel.component';
import { ItemRowComponent } from './item-row/item-row.component';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ListCrystalsPanelComponent } from './list-crystals-panel/list-crystals-panel.component';
import { FormsModule } from '@angular/forms';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { ClipboardModule } from 'ngx-clipboard';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { IconsModule } from '../../core/icons/icons.module';
import { TradeIconPipe } from './trade-icon.pipe';
import { ListHistoryPopupComponent } from './list-history-popup/list-history-popup.component';

const routes: Routes = [
  {
    path: ':listId',
    component: ListDetailsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,

    RouterModule.forChild(routes),

    CoreModule,
    ListModule,
    LayoutModule,
    ItemIconModule,
    PipesModule,
    AlarmsModule,
    ClipboardModule,
    FullpageMessageModule,

    FlexLayoutModule,

    TranslateModule,
    NgZorroAntdModule
  ],
  declarations: [ListDetailsComponent, ListDetailsPanelComponent, ItemRowComponent, ListCrystalsPanelComponent, TradeIconPipe, ListHistoryPopupComponent],
  entryComponents: [ListHistoryPopupComponent]
})
export class ListDetailsModule {
}
