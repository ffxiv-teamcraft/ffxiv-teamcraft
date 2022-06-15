import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { map, shareReplay } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';

@Component({
  selector: 'app-fish-bite-times',
  templateUrl: './fish-bite-times.component.html',
  styleUrls: ['./fish-bite-times.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishBiteTimesComponent {
  public readonly loading$ = this.fishCtx.biteTimesByFish$.pipe(map((res) => res.loading));

  public readonly biteTimeChart$ = this.fishCtx.biteTimesByFish$.pipe(
    map((res) => {
      if (!res.data) return undefined;
      const sortedBiteTimes = Object.values(res.data.byId).sort((a, b) => a.id - b.id);
      return {
        min: (sortedBiteTimes[0] || { id: 0 }).id,
        max: (sortedBiteTimes[sortedBiteTimes.length - 1] || { id: 0 }).id,
        avg: sortedBiteTimes.reduce((acc, entry) => entry.id * entry.occurrences + acc, 0) / res.data.total
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(public readonly settings: SettingsService, public readonly fishCtx: FishContextService) {
  }
}
