import { ChangeDetectionStrategy, Component } from '@angular/core';
import { mapIds } from 'apps/client/src/app/core/data/sources/map-ids';
import { weatherIndex } from 'apps/client/src/app/core/data/sources/weather-index';
import { I18nToolsService } from 'apps/client/src/app/core/tools/i18n-tools.service';
import { LazyDataFacade } from 'apps/client/src/app/lazy-data/+state/lazy-data.facade';
import { SettingsService } from 'apps/client/src/app/modules/settings/settings.service';
import { combineLatest, Observable, of } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';

@Component({
  selector: 'app-fish-weathers',
  templateUrl: './fish-weathers.component.html',
  styleUrls: ['./fish-weathers.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishWeathersComponent {
  public readonly loading$ = this.fishCtx.weathersByFish$.pipe(map((res) => res.loading));

  public readonly weathersChartView$ = this.fishCtx.spotId$.pipe(
    map((id) => [500, id === -1 ? 300 : 200]),
    startWith([500, 200])
  );

  public readonly weathersChartData$ = this.fishCtx.weathersByFish$.pipe(
    switchMap((res) => {
      if (!res.data) return of(undefined);
      const weatherNames: Array<Observable<{ id: number; name: string }>> = Object.values(res.data.byId).map((item) => {
        return this.lazyData.getRow('weathers', item.id).pipe(
          map(weather => this.i18n.getName(weather.name)),
          map((name) => ({ id: item.id, name }))
        );
      });
      return combineLatest([...weatherNames]).pipe(
        map((names) => {
          return Object.values(res.data.byId)
            .map((weather) => {
              const name = names.find((i) => i.id === weather.id)?.name ?? '--';
              return { name, value: weather.occurrences, weatherId: weather.id };
            })
            .sort((a, b) => b.value - a.value);
        }),
        debounceTime(100)
      );
    })
  );

  public readonly weathersChances$ = combineLatest([this.fishCtx.weathersByFish$, this.fishCtx.spotId$, this.lazyData.getEntry('fishingSpots')]).pipe(
    map(([res, spotId, fishingSpots]) => {
      if (!res.data || spotId === undefined) return undefined;
      return Object.values(res.data.byId)
        .sort((a, b) => b.occurrences - a.occurrences)
        .map((entry) => {
          const spotData = fishingSpots.find((row) => row.id === spotId);
          return {
            chances: 100 * this.getWeatherChances(spotData.mapId, entry.id),
            weatherId: entry.id
          };
        });
    })
  );

  constructor(
    private readonly i18n: I18nToolsService,
    private readonly lazyData: LazyDataFacade,
    public readonly settings: SettingsService,
    public readonly fishCtx: FishContextService
  ) {
  }

  private getWeatherChances(mapId: number, weatherId: number): number {
    const index = weatherIndex[mapIds.find((m) => m.id === mapId).weatherRate];
    const maxRate = index[index.length - 1].rate;
    const matchingIndex = index.findIndex((row) => row.weatherId === weatherId);
    if (matchingIndex === -1) {
      return 0;
    }
    if (matchingIndex === 0) {
      return index[matchingIndex].rate / maxRate;
    }
    return (index[matchingIndex].rate - index[matchingIndex - 1].rate) / maxRate;
  }
}
