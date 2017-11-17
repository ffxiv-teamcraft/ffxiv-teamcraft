import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AlarmsComponent} from './alarms/alarms.component';
import {CoreModule} from '../../core/core.module';
import {RouterModule, Routes} from '@angular/router';
import {AlarmCardComponent} from './alarm-card/alarm-card.component';
import {MatButtonModule, MatCardModule, MatGridListModule, MatIconModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {PipesModule} from '../../pipes/pipes.module';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';

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
        MatIconModule,
        MatButtonModule,

        CoreModule,
        CommonComponentsModule,
    ],
    declarations: [
        AlarmsComponent,
        AlarmCardComponent
    ]
})
export class AlarmsModule {
}
