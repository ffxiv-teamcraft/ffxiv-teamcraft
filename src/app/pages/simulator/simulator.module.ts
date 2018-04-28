import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SimulatorPageComponent} from './components/simulator-page/simulator-page.component';
import {SimulatorComponent} from './components/simulator/simulator.component';
import {RouterModule, Routes} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {PipesModule} from '../../pipes/pipes.module';
import {MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule} from '@angular/material';
import {ActionComponent} from './components/action/action.component';
import {CraftingActionsRegistry} from './model/crafting-actions-registry';
import {CoreModule} from 'app/core/core.module';

const routes: Routes = [{
    path: 'simulator',
    component: SimulatorPageComponent
}];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        TranslateModule,

        MatProgressBarModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,

        CommonComponentsModule,
        PipesModule,
        CoreModule,
    ],
    declarations: [
        SimulatorPageComponent,
        SimulatorComponent,
        ActionComponent
    ],
    providers: [
        CraftingActionsRegistry,
    ]
})
export class SimulatorModule {
}
