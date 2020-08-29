import { Injectable } from '@angular/core';
import { ApolloQueryResult } from 'apollo-client';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { FishDataService } from './fish-data.service';

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

/**
 * A service that has a concept of a "current" fish and fishing spot,
 * and provides observables containing information about those "current" entities.
 */
@Injectable()
export class FishContextService {
  private readonly fishIdSub$ = new ReplaySubject<number>();
  /** The fish id that is currently active and being used to filter results by. */
  public readonly fishId$ = this.fishIdSub$.asObservable();
  private readonly spotIdSub$ = new BehaviorSubject<number>(undefined);
  /** The spot id that is currently active and being used to filter results by. */
  public readonly spotId$ = this.spotIdSub$.asObservable();

  /** An observable containing information about the spots of the currently active fish. */
  public readonly spotsByFish$ = this.fishId$.pipe(
    switchMap((fishId) => combineLatest([this.data.getSpotsByFishId(fishId), this.lazyData.fishingSpots$])),
    map(([res, spotData]) => {
      return {
        ...res,
        data: res.data?.spots.map(({ spot }) => ({ spot, spotData: spotData.find((row) => row.id === spot) })),
      };
    }),
    shareReplay(1)
  );

  /** An observable containing the number of recorded occurrences at each Eorzean hour. */
  public readonly hoursByFish$: Observable<OccurrencesResult<number>> = combineLatest([this.fishId$, this.spotId$]).pipe(
    switchMap(([fishId, spotId]) => this.data.getHoursByFishId(fishId, spotId)),
    map((res) => {
      const data = res.data?.etimes.reduce(
        ({ total, byId }, val) => {
          const next = { ...byId, [val.etime]: byId[val.etime] + val.occurences };
          return { total: total + val.occurences, byId: next };
        },
        { total: 0, byId: this.makeHoursDict() }
      );
      return { ...res, data };
    }),
    shareReplay(1)
  );

  private readonly baitMoochesByFish$ = combineLatest([this.fishId$, this.spotId$]).pipe(
    switchMap(([fishId, spotId]) => this.data.getBaitMoochesByFishId(fishId, spotId))
  );

  /** An observable containing information about the baits used to catch the active fish. */
  public readonly baitsByFish$: Observable<OccurrencesResult> = this.baitMoochesByFish$.pipe(map(occurrenceResultMapper('baits', 'baitId')), shareReplay(1));

  /** An observable containing information about the fishes that can be mooched with the active fish. */
  public readonly moochesByFish$: Observable<ApolloQueryResult<number[]>> = this.baitMoochesByFish$.pipe(
    map((res) => {
      const moochList = res.data?.mooches.map((val) => val.itemId);
      const data = moochList ? [...new Set(moochList)] : undefined;
      return { ...res, data };
    }),
    shareReplay(1)
  );

  private readonly hooksetTugsByFish$ = combineLatest([this.fishId$, this.spotId$]).pipe(
    switchMap(([fishId, spotId]) => this.data.getHooksetsByFishId(fishId, spotId))
  );

  /** An observable containing information about the hooksets used to catch the active fish. */
  public readonly hooksetsByFish$: Observable<OccurrencesResult> = this.hooksetTugsByFish$.pipe(
    map(occurrenceResultMapper('hooksets', 'hookset')),
    shareReplay(1)
  );

  /** An observable containing information about the tugs used to catch the active fish. */
  public readonly tugsByFish$: Observable<OccurrencesResult> = this.hooksetTugsByFish$.pipe(map(occurrenceResultMapper('tugs', 'tug')), shareReplay(1));

  /** An observable containing the bite times recorded to catch the active fish. */
  public readonly biteTimesByFish$ = combineLatest([this.fishId$, this.spotId$]).pipe(
    switchMap(([fishId, spotId]) => this.data.getBiteTimesByFishId(fishId, spotId)),
    map(occurrenceResultMapper('biteTimes', 'biteTime')),
    shareReplay(1)
  );

  private readonly weatherAndTransitionsByFish$ = combineLatest([this.fishId$, this.spotId$]).pipe(
    switchMap(([fishId, spotId]) => this.data.getWeatherByFishId(fishId, spotId))
  );

  /** An observable containing information about the weathers recorded to catch the active fish. */
  public readonly weathersByFish$: Observable<OccurrencesResult> = this.weatherAndTransitionsByFish$.pipe(
    map(occurrenceResultMapper('weathers', 'weatherId')),
    shareReplay(1)
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
    shareReplay(1)
  );

  /** An observable containing statistics about the active fish. */
  public readonly statisticsByFish$ = combineLatest([this.fishId$, this.spotId$]).pipe(
    switchMap(([fishId, spotId]) => this.data.getStatisticsByFishId(fishId, spotId)),
    map((res) => {
      if (!res.data) return { ...res, data: undefined };
      const totalSnagging = res.data.snagging.reduce((acc, row) => acc + row.occurences, 0);
      const snagging = (100 * (res.data.snagging.find((entry) => entry.snagging === true) ?? { occurences: 0 }).occurences) / totalSnagging;
      const totalFishEyes = res.data.fishEyes.reduce((acc, row) => acc + row.occurences, 0);
      const fishEyes = (100 * (res.data.fishEyes.find((entry) => entry.fishEyes === true) ?? { occurences: 0 }).occurences) / totalFishEyes;
      return { ...res, data: { ...res.data, snagging, fishEyes } };
    }),
    shareReplay(1)
  );

  /** An observable containing user rankings about the active fish. */
  public readonly rankingsByFish$ = this.fishId$.pipe(switchMap(this.data.getRankingByFishId), shareReplay(1));

  public highlightTime$ = this.etime.getEorzeanTime().pipe(
    distinctUntilChanged((a, b) => a.getUTCHours() === b.getUTCHours()),
    map((time) => {
      return [
        {
          name: `${time.getUTCHours()}:00`,
          value: this.settings.theme.highlight,
        },
      ];
    }),
    shareReplay(1)
  );

  constructor(
    private readonly settings: SettingsService,
    private readonly etime: EorzeanTimeService,
    private readonly data: FishDataService,
    private readonly lazyData: LazyDataService
  ) {}

  /** Sets the currently active fish. */
  public setFishId(fishId: number) {
    this.setSpotId(undefined);
    this.fishIdSub$.next(fishId);
  }

  /** Sets the currently active spot. */
  public setSpotId(spotId?: number) {
    this.spotIdSub$.next(spotId);
  }

  private makeHoursDict(): Record<number, number> {
    const m = {};
    for (let i = 0; i < 24; i++) m[i] = 0;
    return m;
  }
}
