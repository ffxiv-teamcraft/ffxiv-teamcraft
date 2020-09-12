import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LazyDataService } from 'apps/client/src/app/core/data/lazy-data.service';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';

@Component({
  selector: 'app-fishing-spot-bait-datagrid',
  template: `<nz-card
    [nzTitle]="'DB.FISHING_SPOT.Fish_per_bait' | translate"
    class="expanded"
    [nzLoading]="loading$ | async"
    [class.card-with-list]="!(loading$ | async)"
  >
    <ng-template #iconRender let-id>
      <app-item-icon [itemId]="id" width="32"></app-item-icon>
    </ng-template>
    <app-fishing-spot-datagrid
      [activeFish]="activeFish"
      (activeFishChange)="activeFishChange.next($event)"
      [rowIconRender]="iconRender"
      [table]="table$ | async"
    ></app-fishing-spot-datagrid>
  </nz-card>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FishingSpotBaitDatagridComponent {
  @Input()
  public activeFish?: number | undefined;
  @Output()
  public readonly activeFishChange = new EventEmitter<number | undefined>();
  public readonly loading$ = this.fishCtx.baitsBySpotByFish$.pipe(map((res) => res.loading));
  public readonly table$ = combineLatest([this.fishCtx.baitsBySpotByFish$, this.fishCtx.spotId$, this.lazyData.fishingSpots$]).pipe(
    filter(([res]) => !!res.data),
    map(([res, spotId, spots]) => {
      const fishes: number[] = spots.find((spot) => spot.id === spotId)?.fishes ?? [];
      return {
        ...res.data,
        colDefs: res.data.colDefs.sort((a, b) => fishes.indexOf(a.colId) - fishes.indexOf(b.colId)),
      };
    })
  );

  constructor(private readonly fishCtx: FishContextService, private readonly lazyData: LazyDataService) {}
}
