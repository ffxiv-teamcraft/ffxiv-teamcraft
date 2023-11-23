import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipDataService } from './tooltip-data.service';
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { XivapiActionTooltipComponent } from './xivapi-action-tooltip/xivapi-action-tooltip.component';
import { XivapiItemTooltipDirective } from './xivapi-tooltip/xivapi-item-tooltip.directive';
import { XivapiActionTooltipDirective } from './xivapi-action-tooltip/xivapi-action-tooltip.directive';
import { XivapiItemTooltipComponent } from './xivapi-tooltip/xivapi-item-tooltip.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { UiTextPipe } from './xiv-ui-text.pipe';
import { CoreModule } from '../../core/core.module';

import { NodeDetailsModule } from '../node-details/node-details.module';
import { FishDataModule } from '../../pages/db/fish/fish-data.module';
import { NzPipesModule } from 'ng-zorro-antd/pipes';
import { MapModule } from '../map/map.module';
import { AlarmsModule } from '../../core/alarms/alarms.module';

@NgModule({
    imports: [
    CommonModule,
    HttpClientModule,
    OverlayModule,
    FlexLayoutModule,
    TranslateModule,
    PipesModule,
    CoreModule,
    NodeDetailsModule,
    FishDataModule,
    NzPipesModule,
    MapModule,
    AlarmsModule,
    XivapiActionTooltipComponent, XivapiItemTooltipComponent, XivapiItemTooltipDirective, XivapiActionTooltipDirective, UiTextPipe
],
    exports: [XivapiItemTooltipDirective, XivapiActionTooltipDirective, UiTextPipe, XivapiItemTooltipComponent],
    providers: [TooltipDataService]
})
export class TooltipModule {
}
