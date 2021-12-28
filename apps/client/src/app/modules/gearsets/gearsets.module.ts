import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromGearsets from './+state/gearsets.reducer';
import { GearsetsEffects } from './+state/gearsets.effects';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { GearsetCreationPopupComponent } from './gearset-creation-popup/gearset-creation-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MateriaSlotIconComponent } from './materia-slot-icon/materia-slot-icon.component';
import { StatPipe } from './stat.pipe';
import { AriyalaImportPopupComponent } from './ariyala-import-popup/ariyala-import-popup.component';
import { LodestoneImportPopupComponent } from './lodestone-import-popup/lodestone-import-popup.component';
import { GearsetComparatorPopupComponent } from './gearset-comparator-popup/gearset-comparator-popup.component';
import { ItemIconModule } from '../item-icon/item-icon.module';
import { ImportFromPcapPopupComponent } from './import-from-pcap-popup/import-from-pcap-popup.component';
import { GearsetRowComponent } from './gearset-row/gearset-row.component';
import { RouterModule } from '@angular/router';
import { GearsetCostPopupComponent } from './gearset-cost-popup/gearset-cost-popup.component';
import { FullpageMessageModule } from '../fullpage-message/fullpage-message.module';
import { ItemCapsTableComponent } from './item-caps-table/item-caps-table.component';
import { StatsPopupComponent } from './stats-popup/stats-popup.component';
import { SyncFromPcapPopupComponent } from './sync-from-pcap-popup/sync-from-pcap-popup.component';
import { FavoritesModule } from '../favorites/favorites.module';
import { PageLoaderModule } from '../page-loader/page-loader.module';

@NgModule({
  declarations: [
    GearsetCreationPopupComponent,
    MateriaSlotIconComponent,
    StatPipe,
    AriyalaImportPopupComponent,
    LodestoneImportPopupComponent,
    GearsetComparatorPopupComponent,
    ImportFromPcapPopupComponent,
    GearsetRowComponent,
    GearsetCostPopupComponent,
    ItemCapsTableComponent,
    StatsPopupComponent,
    SyncFromPcapPopupComponent
  ],
  imports: [
    CommonModule,

    NzFormModule,
    NzSelectModule,
    NzInputModule,
    NzButtonModule,
    NzAlertModule,
    NzDividerModule,
    NzModalModule,
    NzToolTipModule,
    NzPopconfirmModule,
    NzIconModule,
    NzMessageModule,

    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    CoreModule,
    FlexLayoutModule,

    StoreModule.forFeature(
      fromGearsets.GEARSETS_FEATURE_KEY,
      fromGearsets.reducer
    ),
    EffectsModule.forFeature([GearsetsEffects]),

    TranslateModule,
    RouterModule,
    ItemIconModule,
    FullpageMessageModule,
    NzTagModule,
    NzTimelineModule,
    FavoritesModule,
    PageLoaderModule
  ],
  exports: [
    MateriaSlotIconComponent,
    StatPipe,
    GearsetRowComponent,
    GearsetCostPopupComponent,
    ItemCapsTableComponent,
    StatsPopupComponent
  ]
})
export class GearsetsModule {
}
