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
import { UiColorsService } from './ui-colors.service';
import { UiTextPipe } from './xiv-ui-text.pipe';
import { CoreModule } from '../../core/core.module';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    OverlayModule,
    FlexLayoutModule,
    NgZorroAntdModule,
    TranslateModule,
    PipesModule,
    CoreModule
  ],
  declarations: [XivapiActionTooltipComponent, XivapiItemTooltipComponent, XivapiItemTooltipDirective, XivapiActionTooltipDirective, UiTextPipe],
  exports: [XivapiItemTooltipDirective, XivapiActionTooltipDirective],
  entryComponents: [XivapiActionTooltipComponent, XivapiItemTooltipComponent],
  providers: [TooltipDataService, UiColorsService]
})
export class TooltipModule {
}
