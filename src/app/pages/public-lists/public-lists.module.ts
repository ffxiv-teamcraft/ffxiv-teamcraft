import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PublicListsComponent} from './public-lists/public-lists.component';
import {RouterModule, Routes} from '@angular/router';
import {MatButtonModule, MatIconModule, MatInputModule, MatListModule, MatSelectModule} from '@angular/material';
import {CoreModule} from '../../core/core.module';
import {DatabaseModule} from '../../core/database/database.module';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {FormsModule} from '@angular/forms';

const routes: Routes = [{
    path: 'public-lists',
    component: PublicListsComponent
}];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        CoreModule,
        DatabaseModule,
        CommonComponentsModule,

        RouterModule.forChild(routes),

        MatListModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        MatInputModule,
    ],
    declarations: [PublicListsComponent]
})
export class PublicListsModule {
}
