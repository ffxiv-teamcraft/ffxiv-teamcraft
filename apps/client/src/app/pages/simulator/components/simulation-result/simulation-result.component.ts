import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SimulationReliabilityReport, SimulationResult } from '@ffxiv-teamcraft/simulator';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../../../modules/settings/settings.service';

@Component({
  selector: 'app-simulation-result',
  templateUrl: './simulation-result.component.html',
  styleUrls: ['./simulation-result.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimulationResultComponent {

  @Input()
  result: SimulationResult;

  @Input()
  report: SimulationReliabilityReport;

  @Input()
  custom = false;

  @Input()
  compact = false;

  @Input()
  itemId: number;

  @Input()
  readonly = false;

  @Input()
  thresholds: number[] = [];

  @Input()
  progressPer100: number;

  @Input()
  qualityPer100: number;

  @Output()
  changeRecipe: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  snapshotStepChange: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  snapshotModeChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  snapshotMode = false;

  constructor(private message: NzMessageService, private translate: TranslateService,
              public settings: SettingsService) {
  }

  barFormat(current: number, max: number): () => string {
    return () => `${current}/${max}`;
  }

  barPercent(current: number, max: number): number {
    return Math.min(100 * current / max, 100);
  }

  nameCopied(key: string, args?: any): void {
    this.message.success(this.translate.instant(key, args));
  }
}
