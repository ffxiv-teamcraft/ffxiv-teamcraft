import { Injectable } from '@angular/core';
import { map, Observable, shareReplay, switchMap } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import {
  BaitsPerFishPerSpotQuery,
  BiteTimesPerFishPerSpotPerBaitQuery,
  BiteTimesPerFishPerSpotQuery,
  EorzeaTimesPerFishPerSpotQuery,
  FishStatisticsPerFishPerSpotQuery,
  HooksetTugsPerFishPerSpotQuery,
  RankingPerFishQuery,
  SpotsPerFishQuery,
  WeathersPerFishPerSpotQuery
} from './fish-data.gql';
import { QueryOptionsAlone } from 'apollo-angular/types';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';

const qOpts: QueryOptionsAlone<any> = { fetchPolicy: 'network-only' };

/**
 * A service for querying fish data.
 */
@Injectable()
export class FishDataService {
  constructor(
    private readonly auth: AuthFacade,
    private readonly spotsFishQuery: SpotsPerFishQuery,
    private readonly etimeFishSpotQuery: EorzeaTimesPerFishPerSpotQuery,
    private readonly baitFishSpotQuery: BaitsPerFishPerSpotQuery,
    private readonly hooksFishSpotQuery: HooksetTugsPerFishPerSpotQuery,
    private readonly biteFishSpotQuery: BiteTimesPerFishPerSpotQuery,
    private readonly biteFishSpotBaitQuery: BiteTimesPerFishPerSpotPerBaitQuery,
    private readonly statFishSpotQuery: FishStatisticsPerFishPerSpotQuery,
    private readonly weathersFishSpotQuery: WeathersPerFishPerSpotQuery,
    private readonly rankingFishQuery: RankingPerFishQuery,
    private readonly apollo: Apollo
  ) {
  }

  /**
   * Creates an observable that contains information about the spots for the given fish.
   *
   * @param fishId The fish id to query for.
   * @returns An apollo result observable containing information about the spots for the given fish.
   */
  public getSpotsByFishId = (fishId: number) => {
    return this.spotsFishQuery.fetch({ fishId }, qOpts);
  };

  /**
   * Creates an observable that contains information about hours that a fish can be caught at.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing information about hours that a fish can be caught at.
   */
  public getHours = (fishId?: number, spotId?: number) => {
    return this.etimeFishSpotQuery.fetch({ fishId, spotId }, qOpts);
  };

  /**
   * Creates an observable that contains information about the baits used to catch a fish, and which fishes the given fish is (mooch) bait for.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @param showMisses should we include misses?
   * @returns An apollo result observable containing information about the baits used to catch a fish, and which fishes the given fish is (mooch) bait for.
   */
  public getBaitMooches = (fishId?: number, spotId?: number, showMisses?: boolean) => {
    return this.baitFishSpotQuery.fetch({ fishId, spotId, misses: showMisses ? -2 : 1 }, qOpts);
  };

  /**
   * Creates an observable that contains information about the hooksets and tugs used to catch the given fish.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing information about the hooksets and tugs used to catch the given fish.
   */
  public getHooksets = (fishId?: number, spotId?: number) => {
    return this.hooksFishSpotQuery.fetch({ fishId, spotId }, qOpts);
  };

  /**
   * Creates an observable that contains information about bite times for the given fish.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @param baitId The bait id to filter by.
   * @returns An apollo result observable containing information about bite times for the given fish.
   */
  public getBiteTimesByBait = (fishId?: number, spotId?: number, baitId?: number) => {
    return this.biteFishSpotBaitQuery.fetch({ fishId, spotId, baitId }, qOpts);
  };

  /**
   * Creates an observable that contains information about bite times for the given fish.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing information about bite times for the given fish.
   */
  public getBiteTimes = (fishId?: number, spotId?: number) => {
    return this.biteFishSpotQuery.fetch({ fishId, spotId }, qOpts);
  };

  /**
   * Creates an observable that contains aggregate statistics about the given fish.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing aggregate statistics about the given fish.
   */
  public getStatisticsByFishId = (fishId: number, spotId?: number) => {
    return this.statFishSpotQuery.fetch({ fishId, spotId }, qOpts);
  };

  /**
   * Creates an observable that contains information about the weathers a fish can be caught during.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing information about the weathers a fish can be caught during.
   */
  public getWeather = (fishId?: number, spotId?: number) => {
    return this.weathersFishSpotQuery.fetch({ fishId, spotId }, qOpts);
  };

  /**
   * Creates an observable that contains information about user statistics for the given fish.
   *
   * @param fishId The fish id to query for.
   * @returns An apollo result observable containing information about user statistics for the given fish.
   */
  public getRankingByFishId = (fishId: number) => {
    return this.auth.userId$.pipe(switchMap((userId) => this.rankingFishQuery.fetch({ fishId, userId }, qOpts)));
  };

  public deleteBaitFromSpot(baitId: number, spot: number): Observable<any> {
    const query = gql`mutation deleteBaitFromSpot($spot: Int!, $baitId: Int!) {
      delete_fishingresults(where: {_and: {baitId: {_eq: $baitId}, spot: {_eq: $spot}}}){
        affected_rows
      }
    }`;
    return this.apollo.mutate({
      mutation: query,
      variables: {
        baitId, spot
      }
    });
  }

  public getTrainStats(trainId: string): Observable<any> {
    const reportsQuery = gql`subscription FishTrainReports($trainId: String!) {
      fishingresults(where: {trainId: {_eq: $trainId}}) {
        itemId,
        date,
        userId,
        baitId,
        mooch,
        size
      }
    }`;
    return this.apollo.subscribe<any>({
      query: reportsQuery,
      fetchPolicy: 'network-only',
      variables: {
        trainId: trainId
      }
    }).pipe(
      map((reports) => {
        return {
          count: reports.data.fishingresults.length,
          reports: reports.data.fishingresults
        };
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}
