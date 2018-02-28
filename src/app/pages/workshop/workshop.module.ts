import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule, MatCardModule, MatIconModule} from '@angular/material';
import {CoreModule} from '../../core/core.module';
import {RouterModule} from '@angular/router';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {WorkshopComponent} from './workshop/workshop.component';

const routes = [{
    path: 'workshop/:id',
    component: WorkshopComponent,
}];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        MatIconModule,
        MatButtonModule,
        MatCardModule,

        CoreModule,
        CommonComponentsModule,
    ],
    declarations: [WorkshopComponent],
    exports: []
})
export class WorkshopModule {
}
