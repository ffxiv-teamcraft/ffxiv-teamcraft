import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { initialState as workshopsInitialState, workshopsReducer } from './+state/workshops.reducer';
import { WorkshopsEffects } from './+state/workshops.effects';
import { WorkshopsFacade } from './+state/workshops.facade';
import { DatabaseModule } from '../../core/database/database.module';
import { WorkshopPanelComponent } from './workshop-panel/workshop-panel.component';
import { TranslateModule } from '@ngx-translate/core';
import { ListModule } from '../list/list.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CoreModule } from '../../core/core.module';

import { CustomLinksModule } from '../custom-links/custom-links.module';
import { ListPickerModule } from '../list-picker/list-picker.module';


import { RouterModule } from '@angular/router';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';


@NgModule({
    imports: [
    CommonModule,
    TranslateModule,
    FlexLayoutModule,
    CoreModule,
    CustomLinksModule,
    DatabaseModule,
    ListModule,
    ListPickerModule,
    StoreModule.forFeature('workshops', workshopsReducer, {
        initialState: workshopsInitialState
    }),
    EffectsModule.forFeature([WorkshopsEffects]),
    RouterModule,
    CdkDropList,
    CdkDrag,
    WorkshopPanelComponent
],
    exports: [WorkshopPanelComponent],
    providers: [WorkshopsFacade]
})
export class WorkshopModule {
}
