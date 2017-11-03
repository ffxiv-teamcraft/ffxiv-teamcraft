import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CartImportComponent} from './cart-import/cart-import.component';
import {RouterModule, Routes} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {MatProgressBarModule} from '@angular/material';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {CoreModule} from '../../core/core.module';

const routes: Routes = [
    {
        path: 'cart-import/:importString',
        component: CartImportComponent
    }
];

@NgModule({
    imports: [
        CommonModule,

        RouterModule.forChild(routes),

        MatProgressBarModule,

        TranslateModule,

        CommonComponentsModule,
        CoreModule,
    ],
    declarations: [CartImportComponent]
})
export class CartImportModule {
}
