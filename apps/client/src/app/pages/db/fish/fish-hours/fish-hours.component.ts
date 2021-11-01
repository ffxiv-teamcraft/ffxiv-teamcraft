import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { SettingsService } from '../../../../modules/settings/settings.service';

@Component({
  selector: 'app-fish-hours',
  templateUrl: './fish-hours.component.html',
  styleUrls: ['./fish-hours.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishHoursComponent {
  public readonly loading$ = this.fishCtx.hoursByFish$.pipe(map((res) => res.loading));

  public readonly etimesChartData$ = this.fishCtx.hoursByFish$.pipe(
    map((res) => {
      if (!res.data) return undefined;
      return Object.entries(res.data.byId).map(([key, value]) => ({ name: `${key.toString().padStart(2, '0')}:00`, value }));
    })
  );

  public readonly fishEyes$ = this.fishCtx.fishEyes$;

  constructor(public readonly settings: SettingsService, public readonly fishCtx: FishContextService) {
  }
}
