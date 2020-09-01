import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsService } from 'apps/client/src/app/modules/settings/settings.service';
import { map, startWith, switchMap, take } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { of, forkJoin, combineLatest } from 'rxjs';
import { mapValues } from 'lodash';
import { LocalizedLazyDataService } from 'apps/client/src/app/core/data/localized-lazy-data.service';
import { I18nToolsService } from 'apps/client/src/app/core/tools/i18n-tools.service';
import { LazyDataService } from 'apps/client/src/app/core/data/lazy-data.service';
import { weatherIndex } from 'apps/client/src/app/core/data/sources/weather-index';
import { mapIds } from 'apps/client/src/app/core/data/sources/map-ids';

@Component({
  selector: 'app-fish-weathers',
  templateUrl: './fish-weathers.component.html',
  styleUrls: ['./fish-weathers.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      const weatherNames = mapValues(res.data.byId, (key) => this.i18n.resolveName(this.l12n.getWeather(key.id)).pipe(take(1)));
      return forkJoin(weatherNames).pipe(
        map((names) => {
          return Object.values(res.data.byId)
            .map((weather) => ({ name: names[weather.id] ?? '--', value: weather.occurrences, weatherId: weather.id }))
            .sort((a, b) => b.value - a.value);
        })
      );
    })
  );

  public readonly weathersChances$ = combineLatest([this.fishCtx.weathersByFish$, this.fishCtx.spotId$, this.lazyData.fishingSpots$]).pipe(
    map(([res, spotId, fishingSpots]) => {
      if (!res.data || spotId === undefined) return undefined;
      return Object.values(res.data.byId)
        .sort((a, b) => b.occurrences - a.occurrences)
        .map((entry) => {
          const spotData = fishingSpots.find((row) => row.id === spotId);
          return {
            chances: 100 * this.getWeatherChances(spotData.mapId, entry.id),
            weatherId: entry.id,
          };
        });
    })
  );

  constructor(
    private readonly l12n: LocalizedLazyDataService,
    private readonly i18n: I18nToolsService,
    private readonly lazyData: LazyDataService,
    public readonly settings: SettingsService,
    public readonly fishCtx: FishContextService
  ) {}

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
