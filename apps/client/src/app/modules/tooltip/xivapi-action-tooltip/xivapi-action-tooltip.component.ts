import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-xivdb-tooltip-component',
  templateUrl: './xivapi-action-tooltip.component.html',
  styleUrls: ['./xivapi-action-tooltip.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XivapiActionTooltipComponent implements OnInit {

  @Input() action: any;

  details: { name: string, value: any, requiresPipe: boolean }[];

  ngOnInit(): void {
    if (this.action.PrimaryCostValue) {
      this.details = [
        { name: 'TOOLTIP.Level', value: this.action.ClassJobLevel.toString(), requiresPipe: false },
        { name: 'TOOLTIP.Cost', value: this.action.PrimaryCostValue.toString(), requiresPipe: false },
        { name: 'TOOLTIP.Class_job', value: this.action.ClassJobCategory, requiresPipe: true }
      ];
    } else {
      this.details = [
        { name: 'TOOLTIP.Level', value: this.action.ClassJobLevel.toString(), requiresPipe: false },
        { name: 'TOOLTIP.Class_job', value: this.action.ClassJobCategory, requiresPipe: true }
      ];
    }
  }

}
