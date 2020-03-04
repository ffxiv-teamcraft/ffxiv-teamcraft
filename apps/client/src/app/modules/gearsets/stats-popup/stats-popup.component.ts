import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { StatsService } from '../stats.service';
import { TranslateService } from '@ngx-translate/core';

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

  _hideDisclaimer = localStorage.getItem('gearset:hide_disclaimer') === 'true';

  get hideDisclaimer(): boolean {
    return this._hideDisclaimer;
  }

  set hideDisclaimer(hide: boolean) {
    this._hideDisclaimer = hide;
    localStorage.setItem('gearset:hide_disclaimer', hide.toString());
  }

  constructor(private statsService: StatsService, public translate: TranslateService) {
  }

  getDisplay(): any[] {
    return this.statsService.getStatsDisplay(this.gearset, this.level, this.tribe, this.food);
  }

}
