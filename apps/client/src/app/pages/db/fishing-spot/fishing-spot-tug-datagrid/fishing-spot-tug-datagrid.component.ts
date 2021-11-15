import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';

@Component({
  selector: 'app-fishing-spot-tug-datagrid',
  templateUrl: './fishing-spot-tug-datagrid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishingSpotTugDatagridComponent {
  @Input()
  public activeFish?: number | undefined;
  @Output()
  public readonly activeFishChange = new EventEmitter<number | undefined>();

  public readonly loading$ = this.fishCtx.tugsBySpotByFish$.pipe(map((res) => res.loading));
  public readonly table$ = combineLatest([this.fishCtx.tugsBySpotByFish$, this.fishCtx.spotId$, this.lazyData.getEntry('fishingSpots')]).pipe(
    filter(([res]) => !!res.data),
    map(([res, spotId, spots]) => {
      const fishes: number[] = spots.find((spot) => spot.id === spotId)?.fishes ?? [];
      return {
        ...res.data,
        colDefs: res.data.colDefs.sort((a, b) => a.colId - b.colId),
        data: res.data.data.sort((a, b) => fishes.indexOf(a.rowId) - fishes.indexOf(b.rowId))
      };
    })
  );

  constructor(private readonly fishCtx: FishContextService, private readonly lazyData: LazyDataFacade) {
  }
}
