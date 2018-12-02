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
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    OverlayModule,
    FlexLayoutModule,
    NgZorroAntdModule,
    TranslateModule,
    PipesModule
  ],
  declarations: [XivapiActionTooltipComponent, XivapiItemTooltipComponent, XivapiItemTooltipDirective, XivapiActionTooltipDirective],
  exports: [XivapiItemTooltipDirective, XivapiActionTooltipDirective],
  entryComponents: [XivapiActionTooltipComponent, XivapiItemTooltipComponent],
  providers: [TooltipDataService]
})
export class TooltipModule {
}
