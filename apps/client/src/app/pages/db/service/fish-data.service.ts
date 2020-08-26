import { Injectable } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import {
  BaitsPerFishPerSpotQuery,
  BaitsPerFishQuery,
  BiteTimesPerFishPerSpotQuery,
  BiteTimesPerFishQuery,
  EorzeaTimesPerFishPerSpotQuery,
  EorzeaTimesPerFishQuery,
  FishStatisticsPerFishPerSpotQuery,
  FishStatisticsPerFishQuery,
  HooksetTugsPerFishPerSpotQuery,
  HooksetTugsPerFishQuery,
  RankingPerFishQuery,
  SpotsPerFishQuery,
  WeathersPerFishPerSpotQuery,
  WeathersPerFishQuery,
} from './fish-data.gql';

const qOpts = { useInitialLoading: true };

@Injectable()
export class FishDataService {
  constructor(
    private readonly auth: AuthFacade,
    private readonly spotsFishQuery: SpotsPerFishQuery,
    private readonly etimeFishQuery: EorzeaTimesPerFishQuery,
    private readonly etimeFishSpotQuery: EorzeaTimesPerFishPerSpotQuery,
    private readonly baitFishQuery: BaitsPerFishQuery,
    private readonly baitFishSpotQuery: BaitsPerFishPerSpotQuery,
    private readonly hooksFishQuery: HooksetTugsPerFishQuery,
    private readonly hooksFishSpotQuery: HooksetTugsPerFishPerSpotQuery,
    private readonly biteFishQuery: BiteTimesPerFishQuery,
    private readonly biteFishSpotQuery: BiteTimesPerFishPerSpotQuery,
    private readonly statFishQuery: FishStatisticsPerFishQuery,
    private readonly statFishSpotQuery: FishStatisticsPerFishPerSpotQuery,
    private readonly weathersFishQuery: WeathersPerFishQuery,
    private readonly weathersFishSpotQuery: WeathersPerFishPerSpotQuery,
    private readonly rankingFishQuery: RankingPerFishQuery
  ) {}

  public getSpotsByFishId = (fishId: number) => {
    return this.spotsFishQuery.watch({ fishId }, qOpts).valueChanges;
  };

  public getHoursByFishId = (fishId: number, spotId?: number) => {
    if (spotId === undefined) return this.etimeFishQuery.watch({ fishId }, qOpts).valueChanges;
    return this.etimeFishSpotQuery.watch({ fishId, spotId }, qOpts).valueChanges;
  };

  public getBaitMoochesByFishId = (fishId: number, spotId?: number) => {
    if (spotId === undefined) return this.baitFishQuery.watch({ fishId }, qOpts).valueChanges;
    return this.baitFishSpotQuery.watch({ fishId, spotId }, qOpts).valueChanges;
  };

  public getHooksetsByFishId = (fishId: number, spotId?: number) => {
    if (spotId === undefined) return this.hooksFishQuery.watch({ fishId }, qOpts).valueChanges;
    return this.hooksFishSpotQuery.watch({ fishId, spotId }, qOpts).valueChanges;
  };

  public getBiteTimesByFishId = (fishId: number, spotId?: number) => {
    if (spotId === undefined) return this.biteFishQuery.watch({ fishId }, qOpts).valueChanges;
    return this.biteFishSpotQuery.watch({ fishId, spotId }, qOpts).valueChanges;
  };

  public getStatisticsByFishId = (fishId: number, spotId?: number) => {
    if (spotId === undefined) return this.statFishQuery.watch({ fishId }, qOpts).valueChanges;
    return this.statFishSpotQuery.watch({ fishId, spotId }, qOpts).valueChanges;
  };

  public getWeatherByFishId = (fishId: number, spotId?: number) => {
    if (spotId === undefined) return this.weathersFishQuery.watch({ fishId }, qOpts).valueChanges;
    return this.weathersFishSpotQuery.watch({ fishId, spotId }, qOpts).valueChanges;
  };

  public getRankingByFishId = (fishId: number) => {
    return this.auth.userId$.pipe(switchMap((userId) => this.rankingFishQuery.watch({ fishId, userId }, qOpts).valueChanges));
  };
}
