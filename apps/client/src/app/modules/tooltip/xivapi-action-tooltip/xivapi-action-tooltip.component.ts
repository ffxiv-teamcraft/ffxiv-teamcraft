import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { StepState } from '@ffxiv-teamcraft/simulator';
import { LazyActionsDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-actions-database-page';
import { NzPipesModule } from 'ng-zorro-antd/pipes';
import { I18nPipe } from '../../../core/i18n.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NgIf, NgFor } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-xivdb-tooltip-component',
    templateUrl: './xivapi-action-tooltip.component.html',
    styleUrls: ['./xivapi-action-tooltip.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgIf, NgFor, NzGridModule, TranslateModule, I18nPipe, NzPipesModule]
})
export class XivapiActionTooltipComponent implements OnInit {

  @Input() action: LazyActionsDatabasePage;

  @Input() state: StepState;

  @Input() stateColor: string;

  details: { name: string, value: any, requiresPipe: boolean }[];

  constructor(private i18n: I18nToolsService) {
  }

  get stateName(): string {
    if (!this.state) {
      return 'Normal';
    }
    return `${StepState[this.state].charAt(0).toUpperCase()}${StepState[this.state].slice(1).toLowerCase()}`;
  }

  ngOnInit(): void {
    this.details = [];
    if (this.action.level) {
      this.details.push({ name: 'TOOLTIP.Level', value: this.action.level.toString(), requiresPipe: false });
    }
    if (this.action.primaryCostValue) {
      this.details.push({ name: 'TOOLTIP.Cost', value: this.action.primaryCostValue.toString(), requiresPipe: false });
    }
    if (this.action.job) {
      this.details.push({ name: 'TOOLTIP.Class_job', value: this.i18n.getNameObservable('jobAbbr', this.action.job), requiresPipe: true });
    }
  }
}
