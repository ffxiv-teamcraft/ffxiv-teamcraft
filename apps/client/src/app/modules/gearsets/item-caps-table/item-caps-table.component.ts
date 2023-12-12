import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StatsService } from '../stats.service';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { combineLatest } from 'rxjs';
import { observeInput } from '../../../core/rxjs/observe-input';
import { switchMap } from 'rxjs/operators';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-item-caps-table',
    templateUrl: './item-caps-table.component.html',
    styleUrls: ['./item-caps-table.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NgFor, AsyncPipe, I18nPipe, TranslateModule, I18nRowPipe]
})
export class ItemCapsTableComponent {

  @Input()
  job: number;

  @Input()
  equipmentPiece: EquipmentPiece;

  maxValuesTable$ = combineLatest([
    observeInput(this, 'job'),
    observeInput(this, 'equipmentPiece')
  ]).pipe(
    switchMap(([job, equipmentPiece]) => {
      return this.statsService.getMaxValuesTable(job, equipmentPiece);
    })
  );

  constructor(private statsService: StatsService) {
  }

}
