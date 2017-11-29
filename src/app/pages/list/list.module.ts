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
import { ListTagsPopupComponent } from './list-tags-popup/list-tags-popup.component';

const routes: Routes = [
    {
        path: 'list/:uid/:listId',
        redirectTo: 'list/:listId'
    },
    {
        path: 'list/:listId',
        component: ListDetailsComponent
    },
    {
        path: 'list-inventory/:listId',
        component: ListInventoryComponent
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

        FlexLayoutModule,

        CoreModule,
        PricingModule,
        CommonComponentsModule,
        PipesModule,
        SettingsModule,
        ItemModule,
    ],
    declarations: [
        ListDetailsComponent,
        ListDetailsPanelComponent,
        RegenerationPopupComponent,
        TimerOptionsPopupComponent,
        ListNoteComponent,
        ListInventoryComponent,
        ListTagsPopupComponent,
    ],
    entryComponents: [
        RegenerationPopupComponent,
        TimerOptionsPopupComponent,
        ListTagsPopupComponent
    ]
})
export class ListModule {
}
