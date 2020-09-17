import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LazyDataService } from 'apps/client/src/app/core/data/lazy-data.service';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';

@Component({
  selector: 'app-fishing-spot-weather-datagrid',
  templateUrl: './fishing-spot-weather-datagrid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FishingSpotWeatherDatagridComponent {
  @Input()
  public activeFish?: number | undefined;
  @Output()
  public readonly activeFishChange = new EventEmitter<number | undefined>();

  public readonly loading$ = this.fishCtx.weathersBySpotByFish$.pipe(map((res) => res.loading));
  public readonly table$ = combineLatest([this.fishCtx.weathersBySpotByFish$, this.fishCtx.spotId$, this.lazyData.fishingSpots$]).pipe(
    filter(([res]) => !!res.data),
    map(([res, spotId, spots]) => {
      const fishes: number[] = spots.find((spot) => spot.id === spotId)?.fishes ?? [];
      return {
        ...res.data,
        data: res.data.data.sort((a, b) => fishes.indexOf(a.rowId) - fishes.indexOf(b.rowId)),
        colDefs: res.data.colDefs.sort((a, b) => a.colId - b.colId),
      };
    })
  );

  constructor(private readonly fishCtx: FishContextService, private readonly lazyData: LazyDataService) {}
}
