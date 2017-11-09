import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RecipesComponent} from './recipes/recipes.component';
import {RouterModule, Routes} from '@angular/router';
import {CoreModule} from '../../core/core.module';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule, MatProgressSpinnerModule,
    MatRadioModule
} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {SettingsModule} from '../../modules/settings/settings.module';
import {PipesModule} from '../../pipes/pipes.module';
import {TooltipModule} from '../../modules/tooltip/tooltip.module';
import {BulkAdditionPopupComponent} from './bulk-addition-popup/bulk-addition-popup.component';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';

const routes: Routes = [
    {
        path: 'recipes',
        component: RecipesComponent
    },
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        RouterModule.forChild(routes),

        MatIconModule,
        MatExpansionModule,
        MatButtonModule,
        MatRadioModule,
        MatListModule,
        MatCheckboxModule,
        MatMenuModule,
        MatInputModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,

        CoreModule,
        SettingsModule,
        PipesModule,
        TooltipModule,
        CommonComponentsModule,
    ],
    declarations: [
        RecipesComponent,
        BulkAdditionPopupComponent,
    ],
    entryComponents: [
        BulkAdditionPopupComponent,
    ]
})
export class RecipesModule {
}
