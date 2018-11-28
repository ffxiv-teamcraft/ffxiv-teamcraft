import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipDataService } from './tooltip-data.service';
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { XivapiActionTooltipComponent } from './xivapi-action-tooltip/xivapi-action-tooltip.component';
import { XivapiItemTooltipDirective } from './xivapi-tooltip/xivapi-item-tooltip.directive';
import { XivapiActionTooltipDirective } from './xivapi-action-tooltip/xivapi-action-tooltip.directive';
import { XivapiItemTooltipComponent } from './xivapi-tooltip/xivapi-item-tooltip.component';
import { XivapiI18nPipe } from './xivapi-i18n.pipe';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    OverlayModule,
    FlexLayoutModule,
    NgZorroAntdModule,
    TranslateModule
  ],
  declarations: [XivapiActionTooltipComponent, XivapiItemTooltipComponent, XivapiItemTooltipDirective, XivapiActionTooltipDirective, XivapiI18nPipe],
  exports: [XivapiItemTooltipDirective, XivapiActionTooltipDirective],
  entryComponents: [XivapiActionTooltipComponent, XivapiItemTooltipComponent],
  providers: [TooltipDataService]
})
export class TooltipModule {
}
