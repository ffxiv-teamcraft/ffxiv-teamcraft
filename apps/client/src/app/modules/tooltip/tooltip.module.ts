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
import { FishTooltipComponent } from './fish-tooltip/fish-tooltip.component';
import { FishTooltipDirective } from './fish-tooltip/fish-tooltip.directive';
import { AntdSharedModule } from '../../core/antd-shared.module';
import { NodeDetailsModule } from '../node-details/node-details.module';
import { FishDataModule } from '../../pages/db/fish/fish-data.module';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    OverlayModule,
    FlexLayoutModule,
    AntdSharedModule,
    TranslateModule,
    PipesModule,
    CoreModule,
    NodeDetailsModule,
    FishDataModule
  ],
  declarations: [XivapiActionTooltipComponent, XivapiItemTooltipComponent, FishTooltipComponent, XivapiItemTooltipDirective, XivapiActionTooltipDirective, FishTooltipDirective, UiTextPipe],
  exports: [XivapiItemTooltipDirective, XivapiActionTooltipDirective, FishTooltipDirective, UiTextPipe],
  providers: [TooltipDataService]
})
export class TooltipModule {
}
