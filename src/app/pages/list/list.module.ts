import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListDetailsComponent} from './list-details/list-details.component';
import {ListDetailsPanelComponent} from './list-details-panel/list-details-panel.component';
import {CoreModule} from '../../core/core.module';
import {RouterModule, Routes} from '@angular/router';
import {PricingModule} from '../../modules/pricing/pricing.module';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatTooltipModule
} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {PipesModule} from '../../pipes/pipes.module';
import {SettingsModule} from '../settings/settings.module';
import {ItemModule} from '../../modules/item/item.module';
import {RegenerationPopupComponent} from './regeneration-popup/regeneration-popup.component';
import {TimerOptionsPopupComponent} from './timer-options-popup/timer-options-popup.component';
import {ListNoteComponent} from './list-note/list-note.component';
import {ListInventoryComponent} from './list-inventory/list-inventory.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ListTagsPopupComponent} from './list-tags-popup/list-tags-popup.component';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';
import {ListHelpComponent} from './list-help/list-help.component';
import {ListLayoutPopupComponent} from './list-layout-popup/list-layout-popup.component';
import {ListLayoutRowComponent} from './list-layout-popup/list-layout-row/list-layout-row.component';
import {ImportInputBoxComponent} from './list-layout-popup/import-input-box/import-input-box.component';
import {ClipboardModule} from 'ngx-clipboard';
import {ListComponent} from './list/list.component';
import {NavigationMapPopupComponent} from './navigation-map-popup/navigation-map-popup.component';
import {MapModule} from '../../modules/map/map.module';
import {ListFinishedPopupComponent} from './list-finished-popup/list-finished-popup.component';
import {TotalPricePopupComponent} from './total-price-popup/total-price-popup.component';

const routes: Routes = [
    {
        path: 'list/:uid/:listId',
        redirectTo: 'list/:listId'
    },
    {
        path: 'list/:listId',
        component: ListComponent,
        canActivate: [MaintenanceGuard]
    },
    {
        path: 'list-inventory/:listId',
        component: ListInventoryComponent,
        canActivate: [MaintenanceGuard]
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        RouterModule.forChild(routes),

        MatButtonModule,
        MatListModule,
        MatTooltipModule,
        MatButtonToggleModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatIconModule,
        MatDialogModule,
        MatInputModule,
        MatSelectModule,
        MatSliderModule,
        MatProgressSpinnerModule,
        MatGridListModule,
        MatTooltipModule,
        MatSlideToggleModule,

        FlexLayoutModule,
        ClipboardModule,

        CoreModule,
        PricingModule,
        CommonComponentsModule,
        PipesModule,
        SettingsModule,
        ItemModule,
        MapModule,
    ],
    declarations: [
        ListDetailsComponent,
        ListDetailsPanelComponent,
        RegenerationPopupComponent,
        TimerOptionsPopupComponent,
        ListNoteComponent,
        ListInventoryComponent,
        ListTagsPopupComponent,
        ListHelpComponent,
        ListLayoutPopupComponent,
        ListLayoutRowComponent,
        ImportInputBoxComponent,
        ListComponent,
        NavigationMapPopupComponent,
        ListFinishedPopupComponent,
        TotalPricePopupComponent,
    ],
    entryComponents: [
        RegenerationPopupComponent,
        TimerOptionsPopupComponent,
        ListTagsPopupComponent,
        ListHelpComponent,
        ListLayoutPopupComponent,
        ImportInputBoxComponent,
        NavigationMapPopupComponent,
        ListFinishedPopupComponent,
        TotalPricePopupComponent,
    ]
})
export class ListModule {
}
