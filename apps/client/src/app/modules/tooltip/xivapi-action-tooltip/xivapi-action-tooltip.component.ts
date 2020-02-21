import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';

@Component({
  selector: 'app-xivdb-tooltip-component',
  templateUrl: './xivapi-action-tooltip.component.html',
  styleUrls: ['./xivapi-action-tooltip.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XivapiActionTooltipComponent implements OnInit {

  constructor(private l12n: LocalizedDataService, private i18n: I18nToolsService) {
  }

  @Input() action: any;

  details: { name: string, value: any, requiresPipe: boolean }[];

  ngOnInit(): void {
    this.details = [];
    if (this.action.ClassJobLevel) {
      this.details.push({ name: 'TOOLTIP.Level', value: this.action.ClassJobLevel.toString(), requiresPipe: false });
    }
    if (this.action.PrimaryCostValue) {
      this.details.push({ name: 'TOOLTIP.Cost', value: this.action.PrimaryCostValue.toString(), requiresPipe: false });
    }
    if (this.action.ClassJobCategory) {
      this.details.push({ name: 'TOOLTIP.Class_job', value: this.l12n.xivapiToI18n(this.action.ClassJobCategory, 'jobCategories'), requiresPipe: true });
    }
  }

  public getDescription(action): string {
    const key = action.ID >= 100000 ? 'craftDescriptions' : 'actionDescriptions';
    return this.i18n.getName(this.l12n.xivapiToI18n(action, key, 'Description'));
  }
}
