import { Injectable } from '@angular/core';
import { ApolloQueryResult } from 'apollo-client';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { FishDataService } from './fish-data.service';
import { ItemContextService } from './item-context.service';
import { mapIds } from '../../../core/data/sources/map-ids';
import { weatherIndex } from '../../../core/data/sources/weather-index';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';

export interface Occurrence {
  id: number;
  occurrences: number;
}

export interface Occurrences<T = Occurrence, K extends string | number = number> {
  total: number;
  byId: Record<K, T>;
}

export type OccurrencesResult<T = Occurrence, K extends string | number = number> = ApolloQueryResult<Occurrences<T, K>>;

export interface WeatherTransitionOccurrence {
  fromId: number;
  toId: number;
  occurrences: number;
}

export interface DatagridColDef<T = number> {
  colId: T;
}

export interface DatagridRow<T extends string | number = number> {
  rowId: number;
  valuesByColId: Record<T, number>;
}

export interface Datagrid<T extends string | number = number> {
  colDefs: Array<DatagridColDef<T>>;
  data: Array<DatagridRow<T>>;
  totals: Record<T, number>;
}

const occurrenceResultMapper = <T extends string, I extends string>(key: T, innerKey: I) => (
  res: ApolloQueryResult<Record<T, Array<Record<I | 'occurences', number>>>>
): OccurrencesResult => {
  const data = res.data?.[key].reduce(
    ({ total, byId }, row) => {
      const id: number = row[innerKey];
      const occurences = row.occurences;
      const next = byId[id] ?? { id, occurrences: 0 };
      next.occurrences += occurences;
      const nextById = { ...byId, [id]: next };
      return { total: total + occurences, byId: nextById };
    },
    { total: 0, byId: {} as Occurrences['byId'] }
  );
  return { ...res, data };
};

const datagridResultMapper = <DataKey extends string, RowKey extends string | number, ColKey extends string | number>(
  dataKey: DataKey,
  rowKey: RowKey,
  colKey: ColKey
) => (res: ApolloQueryResult<Record<DataKey, Array<Record<RowKey | ColKey | 'occurences', number>>>>): ApolloQueryResult<Datagrid<number>> => {
  const rows = res.data?.[dataKey];
  if (!rows) return { ...res, data: undefined };
  const data: Datagrid<number> = { colDefs: [], data: [], totals: {} };
  for (const row of Object.values(rows)) {
    const colId = row[colKey];
    if (!data.colDefs.find((i) => i.colId === colId)) data.colDefs.push({ colId: colId });
    let agg = data.data.find((i) => i.rowId === row[rowKey]);
    const rowId = row[rowKey];
    if (!agg) {
      agg = { rowId, valuesByColId: {} };
      data.data.push(agg);
    }
    agg.valuesByColId[colId] = (agg.valuesByColId[colId] ?? 0) + row.occurences;
    data.totals[colId] = (data.totals[colId] ?? 0) + row.occurences;
  }
  return { ...res, data };
};

/**
 * A service that has a concept of a "current" fish and fishing spot,
 * and provides observables containing information about those "current" entities.
 */
@Injectable()
export class FishContextService {

  private readonly spotIdSub$ = new BehaviorSubject<number | undefined>(undefined);

  /** The spot id that is currently active and being used to filter results by. */
  public readonly spotId$ = this.spotIdSub$.pipe(distinctUntilChanged());

  private readonly baitIdSub$ = new BehaviorSubject<number | undefined>(undefined);

  /** The bait id that is currently active and being used to filter results by. */
  public readonly baitId$ = this.baitIdSub$.pipe(distinctUntilChanged());
  /** The fish id that is currently active and being used to filter results by. */
  public readonly fishId$: Observable<number | undefined> = combineLatest([this.itemContext.itemId$, this.lazyData.getEntry('fishes')]).pipe(
    map(([itemId, fishes]) => (itemId > 0 && fishes.includes(itemId) ? itemId : undefined)),
    distinctUntilChanged()
  );

  /** The fish eyes state that is currently active and being used to filter results by. */
  public readonly fishEyes$ = new BehaviorSubject<boolean>(false);

  public readonly showMisses$ = new BehaviorSubject<boolean>(localStorage.getItem('db:fish:show-misses') === 'true');

  /** An observable containing information about the spots of the currently active fish. */
  public readonly spotsByFish$ = this.fishId$.pipe(
    filter((fishId) => fishId > 0),
    switchMap((fishId) => combineLatest([this.data.getSpotsByFishId(fishId), this.lazyData.getEntry('fishingSpots')])),
    map(([res, spotData]) => {
      return {
        ...res,
        data: res.data?.spots.map(({ spot }) => ({ spot, spotData: spotData.find((row) => row.id === spot) }))
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** An observable containing the number of recorded occurrences at each Eorzean hour. */
  public readonly hoursByFish$: Observable<OccurrencesResult<number>> = combineLatest([this.fishId$, this.spotId$, this.fishEyes$]).pipe(
    filter(([fishId, spotId]) => fishId > 0 || spotId >= 0),
    switchMap(([fishId, spotId, fishEyes]) => {
      return this.data.getHours(fishId, spotId).pipe(
        map((res) => {
          const data = res.data?.etimes
            .filter(row => fishEyes || !row.fishEyes)
            .reduce(
              ({ total, byId }, val) => {
                const next = { ...byId, [val.etime]: byId[val.etime] + val.occurences };
                return { total: total + val.occurences, byId: next };
              },
              { total: 0, byId: this.makeHoursDict() }
            );
          return { ...res, data };
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public readonly hooksetTugsByFish$ = combineLatest([this.fishId$, this.spotId$]).pipe(
    filter(([fishId, spotId]) => fishId > 0 || spotId > 0),
    switchMap(([fishId, spotId]) => this.data.getHooksets(fishId, spotId))
  );

  /** An observable containing information about the hooksets used to catch the active fish. */
  public readonly hooksetsByFish$: Observable<OccurrencesResult> = this.hooksetTugsByFish$.pipe(
    map(occurrenceResultMapper('hooksets', 'hookset')),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** An observable containing information about the tugs used to catch the active fish. */
  public readonly tugsByFish$: Observable<OccurrencesResult> = this.hooksetTugsByFish$.pipe(map(occurrenceResultMapper('tugs', 'tug')), shareReplay({ bufferSize: 1, refCount: true }));

  /** An observable containing the bite times recorded to catch the active fish. */
  public readonly biteTimesByFish$ = combineLatest([this.fishId$, this.spotId$]).pipe(
    filter(([fishId, spotId]) => fishId > 0 || spotId > 0),
    switchMap(([fishId, spotId]) => this.data.getBiteTimes(fishId, spotId)),
    map(occurrenceResultMapper('biteTimes', 'flooredBiteTime')),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public readonly weatherAndTransitionsByFish$ = combineLatest([this.fishId$, this.spotId$]).pipe(
    filter(([fishId, spotId]) => fishId >= 0 || spotId > 0),
    switchMap(([fishId, spotId]) => {
      return this.data.getWeather(fishId, spotId).pipe(
        switchMap(res => {
          if (res.data && spotId) {
            return safeCombineLatest(res.data.weathers.map(e => {
              return this.getPossibleWeathers(spotId).pipe(
                map(possibleWeathers => {
                  return {
                    ...e,
                    matches: spotId >= 10000 || possibleWeathers.includes(e.weatherId)
                  };
                })
              );
            })).pipe(
              map(weathers => {
                res.data.weathers = weathers.filter(w => w.matches);
                return res;
              })
            );
          }
          return of(res);
        })
      );
    })
  );

  /** An observable containing information about the weathers recorded to catch the active fish. */
  public readonly weathersByFish$: Observable<OccurrencesResult> = this.weatherAndTransitionsByFish$.pipe(
    map(occurrenceResultMapper('weathers', 'weatherId')),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** An observable containing information about the weathers recorded to catch the active fish. */
  public readonly weatherTransitionsByFish$ = this.weatherAndTransitionsByFish$.pipe(
    map((res) => {
      const data = res.data?.weatherTransitions.reduce(
        ({ total, byId }, { weatherId, previousWeatherId, occurences }) => {
          const key = `${previousWeatherId}_${weatherId}`;
          const next: WeatherTransitionOccurrence = byId[key] ?? { fromId: previousWeatherId, toId: weatherId, occurrences: 0 };
          next.occurrences += occurences;
          const nextById = { ...byId, [key]: next };
          return { total: total + occurences, byId: nextById };
        },
        { total: 0, byId: {} as Occurrences<WeatherTransitionOccurrence, string>['byId'] }
      );
      return { ...res, data };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** An observable containing statistics about the active fish. */
  public readonly statisticsByFish$ = combineLatest([this.fishId$, this.spotId$]).pipe(
    filter(([fishId, spotId]) => fishId > 0 || spotId > 0),
    switchMap(([fishId, spotId]) => this.data.getStatisticsByFishId(fishId, spotId)),
    map((res) => {
      if (!res.data) return { ...res, data: undefined };
      const totalSnagging = res.data.snagging.reduce((acc, row) => acc + row.occurences, 0);
      const snagging = (100 * res.data.snagging.filter((entry) => entry.snagging === true).reduce((acc, row) => acc + row.occurences, 0)) / totalSnagging;
      return { ...res, data: { ...res.data, snagging } };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** An observable containing user rankings about the active fish. */
  public readonly rankingsByFish$ = this.fishId$.pipe(
    filter((fishId) => fishId >= 0),
    switchMap(this.data.getRankingByFishId),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** An observable containing the bite times recorded to catch fishes at the active spot. */
  public readonly hoursBySpot$ = this.spotId$.pipe(
    filter((spotId) => spotId > 0),
    switchMap((spotId) => this.data.getHours(undefined, spotId)),
    map((res) => {
      const data = res.data?.etimes.reduce<{ total: number; byFish: Record<number, { total: number; byTime: Record<number, number> }> }>(
        ({ total, byFish }, val) => {
          const fishEntry = byFish[val.itemId] ?? { total: 0, byTime: this.makeHoursDict() };
          fishEntry.total += val.occurences;
          fishEntry.byTime[val.etime] += val.occurences;
          const next = { ...byFish, [val.itemId]: fishEntry };
          return { total: total + val.occurences, byFish: next };
        },
        { total: 0, byFish: {} }
      );
      return { ...res, data };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** An observable containing the bite times recorded to catch fishes at the active spot. */
  public readonly biteTimesBySpot$ = combineLatest([this.spotId$, this.baitId$]).pipe(
    filter(([spotId]) => spotId > 0),
    switchMap(([spotId, baitId]) => (baitId >= 0 ? this.data.getBiteTimesByBait(undefined, spotId, baitId) : this.data.getBiteTimes(undefined, spotId))),
    map((res) => {
      const data = res.data?.biteTimes.reduce<{
        total: number;
        byFish: Record<number, { total: number; byTime: Record<number, number> }>;
      }>(
        ({ total, byFish }, val) => {
          const fishEntry = byFish[val.itemId] ?? { total: 0, byTime: {} };
          fishEntry.total += val.occurences;
          fishEntry.byTime[val.flooredBiteTime] = (fishEntry.byTime[val.flooredBiteTime] ?? 0) + val.occurences;
          const next = { ...byFish, [val.itemId]: fishEntry };
          return { total: total + val.occurences, byFish: next };
        },
        { total: 0, byFish: {} }
      );
      return { ...res, data };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** An observable containing the baits needed and mooches possible at the active spot. */
  public readonly baitMoochesBySpot$ = combineLatest([this.spotId$, this.showMisses$]).pipe(
    filter(([spotId]) => spotId > 0),
    tap(([, showMisses]) => localStorage.setItem('db:fish:show-misses', showMisses?.toString())),
    switchMap(([spotId, showMisses]) => this.data.getBaitMooches(undefined, spotId, showMisses))
  );

  /** An observable containing information about the baits used to catch fish at the active spot. */
  public readonly baitsBySpot$: Observable<OccurrencesResult> = this.baitMoochesBySpot$.pipe(map(occurrenceResultMapper('baits', 'baitId')), shareReplay({ bufferSize: 1, refCount: true }));

  /** An observable containing information about the baits used to catch fish at the active spot. */
  public readonly baitsBySpotByFish$: Observable<ApolloQueryResult<Datagrid>> = this.baitMoochesBySpot$.pipe(
    map(datagridResultMapper('baits', 'itemId', 'baitId')),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** An observable containing the tugs and hooksets used to catch fish at the active spot. */
  public readonly hooksetTugsBySpot$ = this.spotId$.pipe(
    filter((spotId) => spotId > 0),
    switchMap((spotId) => this.data.getHooksets(undefined, spotId))
  );

  public readonly tugsBySpotByFish$: Observable<ApolloQueryResult<Datagrid>> = this.hooksetTugsBySpot$.pipe(
    map(datagridResultMapper('tugs', 'itemId', 'tug')),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public readonly hooksetsBySpotByFish$: Observable<ApolloQueryResult<Datagrid>> = this.hooksetTugsBySpot$.pipe(
    map(datagridResultMapper('hooksets', 'itemId', 'hookset')),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public readonly highlightTime$ = this.etime.getEorzeanTime().pipe(
    distinctUntilChanged((a, b) => a.getUTCHours() === b.getUTCHours()),
    map((time) => {
      return [
        {
          name: `${time.getUTCHours().toString().padStart(2, '0')}:00`,
          value: this.settings.theme.highlight
        }
      ];
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private readonly baitMoochesByFish$ = combineLatest([this.fishId$, this.spotId$, this.showMisses$]).pipe(
    filter(([fishId, spotId]) => fishId > 0 || spotId > 0),
    tap(([, showMisses]) => localStorage.setItem('db:fish:show-misses', showMisses?.toString())),
    switchMap(([fishId, spotId, showMisses]) => this.data.getBaitMooches(fishId, spotId, showMisses))
  );

  /** An observable containing information about the baits used to catch the active fish. */
  public readonly baitsByFish$: Observable<OccurrencesResult> = this.baitMoochesByFish$.pipe(map(occurrenceResultMapper('baits', 'baitId')), shareReplay({ bufferSize: 1, refCount: true }));

  /** An observable containing information about the fishes that can be mooched with the active fish. */
  public readonly moochesByFish$: Observable<ApolloQueryResult<number[]>> = this.baitMoochesByFish$.pipe(
    map((res) => {
      const moochList = res.data?.mooches.map((val) => val.itemId);
      const data = moochList ? [...new Set(moochList)] : undefined;
      return { ...res, data };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** An observable containing the weathers at the active spot. */
  private readonly weathersBySpot$ = this.spotId$.pipe(
    filter((spotId) => spotId > 0),
    switchMap((spotId) => this.data.getWeather(undefined, spotId))
  );

  /** An observable containing information about the weathers during which to catch fish at the active spot. */
  public readonly weathersBySpotByFish$: Observable<ApolloQueryResult<Datagrid>> = this.weathersBySpot$.pipe(
    map(datagridResultMapper('weathers', 'itemId', 'weatherId')),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private readonly itemContext: ItemContextService,
    private readonly settings: SettingsService,
    private readonly etime: EorzeanTimeService,
    private readonly data: FishDataService,
    private readonly lazyData: LazyDataFacade
  ) {
  }

  /** Sets the currently active spot. */
  public setSpotId(spotId?: number) {
    this.spotIdSub$.next(spotId);
  }

  /** Sets the currently active bait. */
  public setBaitId(baitId?: number) {
    this.baitIdSub$.next(baitId);
  }

  private getPossibleWeathers(spotId: number): Observable<number[]> {
    return this.lazyData.getEntry('fishingSpots').pipe(
      map(fishingSpots => {
        const spot = fishingSpots.find(s => s.id === spotId);
        const weatherRate = mapIds.find(m => m.id === spot.mapId).weatherRate;
        const rates = weatherIndex[weatherRate];
        return (rates || []).map(rate => rate.weatherId);
      })
    );
  }

  private makeHoursDict(): Record<number, number> {
    const m = {};
    for (let i = 0; i < 24; i++) m[i] = 0;
    return m;
  }
}
