import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { Observable } from 'rxjs';

interface FishDetailsStatsSummary {
  min?: number;
  max?: number;
  avg?: number;
  gathering?: number;
  snagging?: number;
}

@Component({
  selector: 'app-fish-details-container',
  templateUrl: './fish-details-container.component.html',
  styleUrls: ['./fish-details-container.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishDetailsContainerComponent {
  public readonly loading$ = this.fishCtx.statisticsByFish$.pipe(map((res) => res.loading));

  public readonly spotsLoading$ = this.fishCtx.spotsByFish$.pipe(map((res) => res.loading));

  public readonly spotIdFilter$ = this.fishCtx.spotId$.pipe(map((spotId) => spotId ?? -1));

  public readonly spots$ = this.fishCtx.spotsByFish$.pipe(map((res) => res.data));

  public readonly stats$: Observable<FishDetailsStatsSummary> = this.fishCtx.statisticsByFish$.pipe(
    map((res) => ({
      min: res.data?.stats.aggregate.min.size / 10,
      max: res.data?.stats.aggregate.max.size / 10,
      avg: res.data?.stats.aggregate.avg.size / 10,
      gathering: res.data?.stats.aggregate.min.gathering,
      snagging: res.data?.snagging
    })),
    startWith({}),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(public readonly settings: SettingsService, private readonly fishCtx: FishContextService) {
  }

  public setSpotIdFilter(spotId: number) {
    this.fishCtx.setSpotId(spotId === -1 ? undefined : spotId);
  }
}
