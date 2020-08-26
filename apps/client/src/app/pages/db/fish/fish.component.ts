import { Component, Input, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { mapValues } from 'lodash';
import { BehaviorSubject, combineLatest, forkJoin, of } from 'rxjs';
import { distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { LocalizedLazyDataService } from '../../../core/data/localized-lazy-data.service';
import { mapIds } from '../../../core/data/sources/map-ids';
import { weatherIndex } from '../../../core/data/sources/weather-index';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { FishContextService } from '../service/fish-context.service';

@Component({
  selector: 'app-fish',
  templateUrl: './fish.component.html',
  styleUrls: ['./fish.component.less'],
})
export class FishComponent {
  public loading$ = new BehaviorSubject<boolean>(false);

  @Input()
  public set xivapiFish(fish: { ID?: number }) {
    if (fish?.ID >= 0) this.fishCtx.setFishId(fish.ID);
  }

  @Input() usedForTpl: TemplateRef<any>;

  @Input() obtentionTpl: TemplateRef<any>;

  public readonly spotIdFilter$ = this.fishCtx.spotId$.pipe(map((spotId) => spotId ?? -1));

  public readonly etimesChartData$ = this.fishCtx.hoursByFish$.pipe(
    map((res) => {
      if (!res.data) return undefined;
      return Object.entries(res.data.byId).map(([key, value]) => ({ name: `${key.toString().padStart(2, '0')}:00`, value }));
    })
  );

  public readonly baitsChartData$ = this.fishCtx.baitsByFish$.pipe(
    switchMap((res) => {
      if (!res.data) return of(undefined);
      const baitNames = mapValues(res.data.byId, (key) => this.i18n.resolveName(this.l12n.getItem(key.id)));
      return forkJoin(baitNames).pipe(
        map((names) => {
          return Object.values(res.data.byId).map((bait) => ({ name: names[bait.id] ?? '--', value: bait.occurrences, baitId: bait.id }));
        })
      );
    })
  );

  public readonly hooksets$ = this.fishCtx.hooksetsByFish$.pipe(
    map((res) => {
      if (!res.data) return undefined;
      return Object.values(res.data.byId)
        .sort((a, b) => b.occurrences - a.occurrences)
        .map((entry) => ({
          hookset: entry.id === 1 ? 4103 : 4179,
          percent: (100 * entry.occurrences) / res.data.total,
        }));
    })
  );

  public readonly tugs$ = this.fishCtx.tugsByFish$.pipe(
    map((res) => {
      if (!res.data) return undefined;
      return Object.values(res.data.byId)
        .sort((a, b) => b.occurrences - a.occurrences)
        .map((entry) => ({
          tugName: ['Medium', 'Big', 'Light'][entry.id],
          percent: (100 * entry.occurrences) / res.data.total,
        }));
    })
  );

  public readonly biteTimeChart$ = this.fishCtx.biteTimesByFish$.pipe(
    map((res) => {
      if (!res.data) return undefined;
      const sortedBiteTimes = Object.values(res.data.byId).sort((a, b) => a.id - b.id);
      return {
        min: (sortedBiteTimes[0] || { id: 0 }).id,
        max: (sortedBiteTimes[sortedBiteTimes.length - 1] || { id: 0 }).id,
        avg: sortedBiteTimes.reduce((acc, entry) => entry.id * entry.occurrences + acc, 0) / res.data.total,
      };
    })
  );

  public readonly weathersChartView$ = this.fishCtx.spotId$.pipe(
    map((id) => [500, id === -1 ? 300 : 200]),
    startWith([500, 200])
  );

  public readonly weathersChartData$ = this.fishCtx.weathersByFish$.pipe(
    switchMap((res) => {
      if (!res.data) return of(undefined);
      const weatherNames = mapValues(res.data.byId, (key) => this.i18n.resolveName(this.l12n.getItem(key.id)));
      return forkJoin(weatherNames).pipe(
        map((names) => {
          return Object.values(res.data.byId)
            .map((weather) => ({ name: names[weather.id] ?? '--', value: weather.occurrences, weatherId: weather.id }))
            .sort((a, b) => b.value - a.value);
        })
      );
    })
  );

  public readonly weathersChances$ = combineLatest(this.fishCtx.weathersByFish$, this.fishCtx.spotId$, this.lazyData.fishingSpots$).pipe(
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

  public readonly weatherTransitions$ = combineLatest(this.fishCtx.weatherTransitionsByFish$, this.fishCtx.spotId$).pipe(
    map(([res, spotId]) => {
      if (!res.data) return undefined;
      return Object.values(res.data.byId).map((entry) => {
        let transitionChances: number | undefined;
        if (spotId !== undefined) {
          const spotData = this.lazyData.data.fishingSpots.find((row) => row.id === spotId);
          const weatherChances = this.getWeatherChances(spotData.mapId, entry.toId);
          const previousWeatherChances = this.getWeatherChances(spotData.mapId, entry.fromId);
          transitionChances = 100 * weatherChances * previousWeatherChances;
        }
        return {
          ...entry,
          transitionChances,
          percent: (100 * entry.occurrences) / res.data.total,
        };
      });
    })
  );

  public readonly rankings$ = this.fishCtx.rankingsByFish$.pipe(map((res) => res.data?.rankings ?? undefined));

  public readonly userRanking$ = this.fishCtx.rankingsByFish$.pipe(map((res) => res.data?.userRanking?.[0] ?? undefined));

  public highlightTime$ = this.etime.getEorzeanTime().pipe(
    distinctUntilChanged((a, b) => a.getUTCHours() === b.getUTCHours()),
    map((time) => {
      return [
        {
          name: `${time.getUTCHours()}:00`,
          value: this.settings.theme.highlight,
        },
      ];
    })
  );

  constructor(
    private l12n: LocalizedLazyDataService,
    private i18n: I18nToolsService,
    public translate: TranslateService,
    private lazyData: LazyDataService,
    public settings: SettingsService,
    private etime: EorzeanTimeService,
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

  getRankIcon(rank: number): string {
    if (rank < 1 || rank > 3) {
      return '';
    }
    return ['gold', 'silver', 'bronze'][rank - 1];
  }

  public setSpotIdFilter(spotId: number) {
    this.fishCtx.setSpotId(spotId === -1 ? undefined : spotId);
  }
}
