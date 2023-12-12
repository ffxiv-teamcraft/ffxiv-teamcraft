import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AllaganReportSource } from '@ffxiv-teamcraft/types';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { VoyageNamePipe } from '../../../pipes/pipes/voyage-name.pipe';
import { MapNamePipe } from '../../../pipes/pipes/map-name.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgSwitch, NgSwitchCase, NgTemplateOutlet, NgIf, NgSwitchDefault, AsyncPipe, DecimalPipe, CurrencyPipe } from '@angular/common';

@Component({
    selector: 'app-report-source-compact-details',
    templateUrl: './report-source-compact-details.component.html',
    styleUrls: ['./report-source-compact-details.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgSwitch, NgSwitchCase, NgTemplateOutlet, FlexModule, DbButtonComponent, NgIf, NzButtonModule, NzIconModule, NgSwitchDefault, ItemIconComponent, I18nNameComponent, AsyncPipe, DecimalPipe, CurrencyPipe, I18nPipe, TranslateModule, I18nRowPipe, XivapiIconPipe, MapNamePipe, VoyageNamePipe, LazyRowPipe]
})
export class ReportSourceCompactDetailsComponent {

  AllaganReportSource = AllaganReportSource;

  @Input()
  source: AllaganReportSource;

  @Input()
  data: any;

  @Input()
  fullDisplayMode = false;

}
