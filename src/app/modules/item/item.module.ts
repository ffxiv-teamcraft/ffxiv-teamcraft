import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ItemComponent} from './item/item.component';
import {
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule
} from '@angular/material';
import {TooltipModule} from '../tooltip/tooltip.module';
import {CoreModule} from '../../core/core.module';
import {PipesModule} from '../../pipes/pipes.module';
import {SettingsModule} from '../../pages/settings/settings.module';
import {ClipboardModule} from 'ngx-clipboard';
import {CommentsModule} from '../comments/comments.module';
import {CommonComponentsModule} from '../common-components/common-components.module';
import {DesynthPopupComponent} from './desynth-popup/desynth-popup.component';
import {DropsDetailsPopupComponent} from './drops-details-popup/drops-details-popup.component';
import {FishDetailsPopupComponent} from './fish-details-popup/fish-details-popup.component';
import {GatheredByPopupComponent} from './gathered-by-popup/gathered-by-popup.component';
import {InstancesDetailsPopupComponent} from './instances-details-popup/instances-details-popup.component';
import {ReductionDetailsPopupComponent} from './reduction-details-popup/reduction-details-popup.component';
import {RequirementsPopupComponent} from './requirements-popup/requirements-popup.component';
import {TradeDetailsPopupComponent} from './trade-details-popup/trade-details-popup.component';
import {VendorsDetailsPopupComponent} from './vendors-details-popup/vendors-details-popup.component';
import {VoyagesDetailsPopupComponent} from './voyages-details-popup/voyages-details-popup.component';
import {MapModule} from '../map/map.module';
import {DatabaseModule} from '../../core/database/database.module';
import {RouterModule} from '@angular/router';
import {VentureDetailsPopupComponent} from './venture-details-popup/venture-details-popup.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,

        MatListModule,
        MatTooltipModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatChipsModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        MatInputModule,
        MatCardModule,

        ClipboardModule,

        CoreModule,
        TooltipModule,
        DatabaseModule,
        SettingsModule,
        PipesModule,
        CommentsModule,
        CommonComponentsModule,
        MapModule,
    ],
    declarations: [
        ItemComponent,
        DesynthPopupComponent,
        DropsDetailsPopupComponent,
        FishDetailsPopupComponent,
        GatheredByPopupComponent,
        InstancesDetailsPopupComponent,
        ReductionDetailsPopupComponent,
        RequirementsPopupComponent,
        TradeDetailsPopupComponent,
        VendorsDetailsPopupComponent,
        VoyagesDetailsPopupComponent,
        VentureDetailsPopupComponent,
    ],
    exports: [
        ItemComponent
    ],
    entryComponents: [
        DesynthPopupComponent,
        DropsDetailsPopupComponent,
        FishDetailsPopupComponent,
        GatheredByPopupComponent,
        InstancesDetailsPopupComponent,
        ReductionDetailsPopupComponent,
        RequirementsPopupComponent,
        TradeDetailsPopupComponent,
        VendorsDetailsPopupComponent,
        VoyagesDetailsPopupComponent,
        VentureDetailsPopupComponent,
    ]
})
export class ItemModule {
}
