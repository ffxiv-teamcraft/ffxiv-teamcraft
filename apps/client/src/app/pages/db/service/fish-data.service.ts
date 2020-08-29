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

/**
 * A service for querying fish data.
 */
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

  /**
   * Creates an observable that contains information about the spots for the given fish.
   *
   * @param fishId The fish id to query for.
   * @returns An apollo result observable containing information about the spots for the given fish.
   */
  public getSpotsByFishId = (fishId: number) => {
    return this.spotsFishQuery.watch({ fishId }, qOpts).valueChanges;
  };

  /**
   * Creates an observable that contains information about hours that a fish can be caught at.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing information about hours that a fish can be caught at.
   */
  public getHoursByFishId = (fishId: number, spotId?: number) => {
    if (spotId === undefined) return this.etimeFishQuery.watch({ fishId }, qOpts).valueChanges;
    return this.etimeFishSpotQuery.watch({ fishId, spotId }, qOpts).valueChanges;
  };

  /**
   * Creates an observable that contains information about the baits used to catch a fish, and which fishes the given fish is (mooch) bait for.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing information about the baits used to catch a fish, and which fishes the given fish is (mooch) bait for.
   */
  public getBaitMoochesByFishId = (fishId: number, spotId?: number) => {
    if (spotId === undefined) return this.baitFishQuery.watch({ fishId }, qOpts).valueChanges;
    return this.baitFishSpotQuery.watch({ fishId, spotId }, qOpts).valueChanges;
  };

  /**
   * Creates an observable that contains information about the hooksets and tugs used to catch the given fish.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing information about the hooksets and tugs used to catch the given fish.
   */
  public getHooksetsByFishId = (fishId: number, spotId?: number) => {
    if (spotId === undefined) return this.hooksFishQuery.watch({ fishId }, qOpts).valueChanges;
    return this.hooksFishSpotQuery.watch({ fishId, spotId }, qOpts).valueChanges;
  };

  /**
   * Creates an observable that contains information about bite times for the given fish.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing information about bite times for the given fish.
   */
  public getBiteTimesByFishId = (fishId: number, spotId?: number) => {
    if (spotId === undefined) return this.biteFishQuery.watch({ fishId }, qOpts).valueChanges;
    return this.biteFishSpotQuery.watch({ fishId, spotId }, qOpts).valueChanges;
  };

  /**
   * Creates an observable that contains aggregate statistics about the given fish.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing aggregate statistics about the given fish.
   */
  public getStatisticsByFishId = (fishId: number, spotId?: number) => {
    if (spotId === undefined) return this.statFishQuery.watch({ fishId }, qOpts).valueChanges;
    return this.statFishSpotQuery.watch({ fishId, spotId }, qOpts).valueChanges;
  };

  /**
   * Creates an observable that contains information about the weathers a fish can be caught during.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing information about the weathers a fish can be caught during.
   */
  public getWeatherByFishId = (fishId: number, spotId?: number) => {
    if (spotId === undefined) return this.weathersFishQuery.watch({ fishId }, qOpts).valueChanges;
    return this.weathersFishSpotQuery.watch({ fishId, spotId }, qOpts).valueChanges;
  };

  /**
   * Creates an observable that contains information about user statistics for the given fish.
   *
   * @param fishId The fish id to query for.
   * @returns An apollo result observable containing information about user statistics for the given fish.
   */
  public getRankingByFishId = (fishId: number) => {
    return this.auth.userId$.pipe(switchMap((userId) => this.rankingFishQuery.watch({ fishId, userId }, qOpts).valueChanges));
  };
}
