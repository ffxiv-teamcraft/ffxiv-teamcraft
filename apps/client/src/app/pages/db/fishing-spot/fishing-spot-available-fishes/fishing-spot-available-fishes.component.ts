import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LazyDataService } from 'apps/client/src/app/core/data/lazy-data.service';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';

@Component({
  selector: 'app-fishing-spot-available-fishes',
  templateUrl: './fishing-spot-available-fishes.component.html',
  styleUrls: ['./fishing-spot-available-fishes.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FishingSpotAvailableFishesComponent {
  public readonly fishes$: Observable<number[] | undefined> = combineLatest([this.fishCtx.spotId$, this.lazyData.fishingSpots$]).pipe(
    filter(([spotId]) => spotId >= 0),
    map(([spotId, spots]) => {
      return spots.find((s) => s.id === spotId)?.fishes?.filter((f) => f > 0);
    }),
    shareReplay(1)
  );

  constructor(private readonly lazyData: LazyDataService, private readonly fishCtx: FishContextService) {}
}
