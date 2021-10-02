import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LazyDataService } from 'apps/client/src/app/core/data/lazy-data.service';
import { LocalizedLazyDataService } from 'apps/client/src/app/core/data/localized-lazy-data.service';
import { I18nToolsService } from 'apps/client/src/app/core/tools/i18n-tools.service';
import { combineLatest, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { Datagrid, FishContextService } from '../../service/fish-context.service';

@Component({
  selector: 'app-fishing-spot-bait-datagrid',
  templateUrl: './fishing-spot-bait-datagrid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishingSpotBaitDatagridComponent {
  @Input()
  public activeFish?: number | undefined;
  @Output()
  public readonly activeFishChange = new EventEmitter<number | undefined>();

  public readonly loading$ = this.fishCtx.baitsBySpotByFish$.pipe(map((res) => res.loading));
  public readonly table$ = combineLatest([this.fishCtx.baitsBySpotByFish$, this.fishCtx.spotId$, this.lazyData.fishingSpots$]).pipe(
    filter(([res]) => !!res.data),
    switchMap(([res, spotId, spots]) => {
      const fishes: number[] = spots.find((spot) => spot.id === spotId)?.fishes ?? [];
      const data = {
        ...res.data,
        data: res.data.data.sort((a, b) => fishes.indexOf(a.rowId) - fishes.indexOf(b.rowId))
      };
      return combineLatest([
        of(data),
        ...res.data.colDefs.map((i) => {
          if (i.colId === -1) {
            return of({
              id: i.colId,
              name: this.translate.instant('DB.FISHING_SPOT.Miss')
            });
          }
          return this.i18n.resolveName(this.l12n.getItem(i.colId)).pipe(map((name) => ({ id: i.colId, name })));
        })
      ]);
    }),
    map(([data, ...names]: [Datagrid, ...{ id: number; name: string }[]]) => {
      return {
        ...data,
        colDefs: data.colDefs.sort((a, b) => {
          const aName = names.find((i) => i.id === a.colId);
          const bName = names.find((i) => i.id === b.colId);
          if (!aName?.name) return 1;
          if (!bName?.name) return -1;
          return aName.name.localeCompare(bName.name);
        })
      };
    })
  );

  showMisses$ = this.fishCtx.showMisses$;

  constructor(
    private readonly fishCtx: FishContextService,
    private readonly lazyData: LazyDataService,
    private readonly i18n: I18nToolsService,
    private readonly l12n: LocalizedLazyDataService,
    private readonly translate: TranslateService
  ) {
  }
}
