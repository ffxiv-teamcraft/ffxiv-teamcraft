import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SimulationReliabilityReport, SimulationResult } from '@ffxiv-teamcraft/simulator';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { I18nRowPipe } from '../../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { IngameStarsPipe } from '../../../../pipes/pipes/ingame-stars.pipe';
import { IfMobilePipe } from '../../../../pipes/pipes/if-mobile.pipe';
import { FloorPipe } from '../../../../pipes/pipes/floor.pipe';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { FormsModule } from '@angular/forms';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { I18nNameComponent } from '../../../../core/i18n/i18n-name/i18n-name.component';
import { ItemNameClipboardDirective } from '../../../../core/item-name-clipboard.directive';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ItemIconComponent } from '../../../../modules/item-icon/item-icon/item-icon.component';
import { NgIf, NgFor, NgStyle, DecimalPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
    selector: 'app-simulation-result',
    templateUrl: './simulation-result.component.html',
    styleUrls: ['./simulation-result.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzCardModule, FlexModule, NgIf, ItemIconComponent, NzToolTipModule, ItemNameClipboardDirective, I18nNameComponent, NzButtonModule, NzWaveModule, NzIconModule, NzInputNumberModule, FormsModule, NzProgressModule, NgFor, NgStyle, ExtendedModule, NzDividerModule, DecimalPipe, TranslateModule, FloorPipe, IfMobilePipe, IngameStarsPipe, I18nPipe, I18nRowPipe]
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
