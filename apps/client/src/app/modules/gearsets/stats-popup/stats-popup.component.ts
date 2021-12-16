import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { StatsService } from '../stats.service';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { observeInput } from '../../../core/rxjs/observe-input';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-stats-popup',
  templateUrl: './stats-popup.component.html',
  styleUrls: ['./stats-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  _hideDisclaimer = localStorage.getItem('gearset:hide_disclaimer') === 'true';

  get hideDisclaimer(): boolean {
    return this._hideDisclaimer;
  }

  set hideDisclaimer(hide: boolean) {
    this._hideDisclaimer = hide;
    localStorage.setItem('gearset:hide_disclaimer', hide.toString());
  }

}
