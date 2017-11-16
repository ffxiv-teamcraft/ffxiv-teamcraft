import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FeaturesComponent} from './features/features.component';
import {RouterModule, Routes} from '@angular/router';
import {MatExpansionModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';

const routes: Routes = [
    {
        path: 'features',
        component: FeaturesComponent
    },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TranslateModule,

        MatExpansionModule,
    ],
    declarations: [
        FeaturesComponent
    ]
})
export class FeaturesModule {
}
