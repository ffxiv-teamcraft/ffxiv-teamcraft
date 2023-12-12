import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { StatsService } from '../stats.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { observeInput } from '../../../core/rxjs/observe-input';
import { switchMap } from 'rxjs/operators';
import { FloorPipe } from '../../../pipes/pipes/floor.pipe';
import { NgIf, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-stats-popup',
    templateUrl: './stats-popup.component.html',
    styleUrls: ['./stats-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgIf, NgFor, AsyncPipe, DecimalPipe, FloorPipe, TranslateModule]
})
export class StatsPopupComponent {

  @Input()
  gearset: TeamcraftGearset;

  @Input()
  level: number;

  @Input()
  tribe: number;

  @Input()
  food: any;

  display$ = combineLatest([
    observeInput(this, 'gearset'),
    observeInput(this, 'level'),
    observeInput(this, 'tribe'),
    observeInput(this, 'food', false)
  ]).pipe(
    switchMap(([gearset, level, tribe, food]) => {
      return this.statsService.getStatsDisplay(gearset, level, tribe, food);
    })
  );

  constructor(private statsService: StatsService, public translate: TranslateService) {
  }
}
