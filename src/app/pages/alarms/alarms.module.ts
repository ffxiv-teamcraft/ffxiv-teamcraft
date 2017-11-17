import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AlarmsComponent} from './alarms/alarms.component';
import {CoreModule} from '../../core/core.module';
import {RouterModule, Routes} from '@angular/router';
import { AlarmCardComponent } from './alarm-card/alarm-card.component';
import {MatCardModule, MatGridListModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {PipesModule} from '../../pipes/pipes.module';

const routes: Routes = [{
    path: 'alarms',
    component: AlarmsComponent
}];

@NgModule({
    imports: [
        CommonModule,

        RouterModule.forChild(routes),
        TranslateModule,
        PipesModule,

        MatCardModule,
        MatGridListModule,

        CoreModule,
    ],
    declarations: [
        AlarmsComponent,
        AlarmCardComponent
    ]
})
export class AlarmsModule {
}
