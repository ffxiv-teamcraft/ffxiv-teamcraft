import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { StepState } from '@ffxiv-teamcraft/simulator';

@Component({
  selector: 'app-xivdb-tooltip-component',
  templateUrl: './xivapi-action-tooltip.component.html',
  styleUrls: ['./xivapi-action-tooltip.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XivapiActionTooltipComponent implements OnInit {

  @Input() action: any;

  @Input() state: StepState;

  @Input() stateColor: string;

  get stateName(): string {
    if (!this.state) {
      return 'Normal';
    }
    return `${StepState[this.state].charAt(0).toUpperCase()}${StepState[this.state].slice(1).toLowerCase()}`;
  }

  details: { name: string, value: any, requiresPipe: boolean }[];

  constructor(private i18n: I18nToolsService) {
  }

  ngOnInit(): void {
    this.details = [];
    if (this.action.ClassJobLevel) {
      this.details.push({ name: 'TOOLTIP.Level', value: this.action.ClassJobLevel.toString(), requiresPipe: false });
    }
    if (this.action.PrimaryCostValue) {
      this.details.push({ name: 'TOOLTIP.Cost', value: this.action.PrimaryCostValue.toString(), requiresPipe: false });
    }
    if (this.action.ClassJobCategory) {
      this.details.push({ name: 'TOOLTIP.Class_job', value: this.i18n.xivapiToI18n(this.action.ClassJobCategory), requiresPipe: true });
    }
  }

  public getDescription(action: any): string {
    return this.i18n.getName(this.i18n.xivapiToI18n(action, 'Description'));
  }
}
