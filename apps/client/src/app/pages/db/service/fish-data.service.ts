import { Injectable, inject } from '@angular/core';
import { map, Observable, shareReplay, switchMap } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import {
  BaitsPerFishPerSpotQuery,
  BiteTimesPerFishPerSpotPerBaitQuery,
  BiteTimesPerFishPerSpotQuery,
  EorzeaTimesPerFishPerSpotQuery,
  FishStatisticsPerFishPerSpotQuery,
  HooksetTugsPerFishPerSpotQuery,
  LuresPerFishPerSpotQuery,
  RankingPerFishQuery,
  SpotsPerFishQuery,
  WeathersPerFishPerSpotQuery
} from './fish-data.gql';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';

const qOpts = { fetchPolicy: 'network-only' } as const;

/**
 * A service for querying fish data.
 */
@Injectable()
export class FishDataService {
  private readonly auth = inject(AuthFacade);
  private readonly spotsFishQuery = inject(SpotsPerFishQuery);
  private readonly etimeFishSpotQuery = inject(EorzeaTimesPerFishPerSpotQuery);
  private readonly baitFishSpotQuery = inject(BaitsPerFishPerSpotQuery);
  private readonly hooksFishSpotQuery = inject(HooksetTugsPerFishPerSpotQuery);
  private readonly luresFishSpotQuery = inject(LuresPerFishPerSpotQuery);
  private readonly biteFishSpotQuery = inject(BiteTimesPerFishPerSpotQuery);
  private readonly biteFishSpotBaitQuery = inject(BiteTimesPerFishPerSpotPerBaitQuery);
  private readonly statFishSpotQuery = inject(FishStatisticsPerFishPerSpotQuery);
  private readonly weathersFishSpotQuery = inject(WeathersPerFishPerSpotQuery);
  private readonly rankingFishQuery = inject(RankingPerFishQuery);
  private readonly apollo = inject(Apollo);


  /**
   * Creates an observable that contains information about the spots for the given fish.
   *
   * @param fishId The fish id to query for.
   * @returns An apollo result observable containing information about the spots for the given fish.
   */
  public getSpotsByFishId = (fishId: number) => {
    return this.spotsFishQuery.fetch({ variables: { fishId }, ...qOpts });
  };

  /**
   * Creates an observable that contains information about hours that a fish can be caught at.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing information about hours that a fish can be caught at.
   */
  public getHours = (fishId?: number, spotId?: number) => {
    return this.etimeFishSpotQuery.fetch({ variables: { fishId, spotId }, ...qOpts });
  };

  /**
   * Creates an observable that contains information about the baits used to catch a fish, and which fishes the given fish is (mooch) bait for.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @param showMisses should we include misses?
   * @param lureFilter Ambitious or Modest lure filter
   * @returns An apollo result observable containing information about the baits used to catch a fish, and which fishes the given fish is (mooch) bait for.
   */
  public getBaitMooches = (fishId?: number, spotId?: number, showMisses?: boolean, lureFilter?: {
    prop: 'aLure' | 'mLure',
    value: number,
    excludeAll?: boolean
  }) => {
    const aLure = { min: -1, max: 9 };
    const mLure = { min: -1, max: 9 };
    if (lureFilter != null) {
      if (lureFilter.excludeAll) {
        aLure.max = 0;
        mLure.max = 0;
      } else if (lureFilter.prop === 'aLure') {
        aLure.min = lureFilter.value;
        aLure.max = lureFilter.value;
      } else if (lureFilter.prop === 'mLure') {
        mLure.min = lureFilter.value;
        mLure.max = lureFilter.value;
      }
    }
    return this.baitFishSpotQuery.fetch({
      variables: {
        fishId,
        spotId,
        misses: showMisses ? -2 : 1,
        aLureMin: aLure.min,
        aLureMax: aLure.max,
        mLureMin: mLure.min,
        mLureMax: mLure.max
      }, ...qOpts
    });
  };

  /**
   * Creates an observable that contains information about the hooksets and tugs used to catch the given fish.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing information about the hooksets and tugs used to catch the given fish.
   */
  public getLures = (fishId?: number, spotId?: number) => {
    return this.luresFishSpotQuery.fetch({ variables: { fishId, spotId }, ...qOpts });
  };

  /**
   * Creates an observable that contains information about the hooksets and tugs used to catch the given fish.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing information about the hooksets and tugs used to catch the given fish.
   */
  public getHooksets = (fishId?: number, spotId?: number) => {
    return this.hooksFishSpotQuery.fetch({ variables: { fishId, spotId }, ...qOpts });
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
    return this.biteFishSpotBaitQuery.fetch({ variables: { fishId, spotId, baitId }, ...qOpts });
  };

  /**
   * Creates an observable that contains information about bite times for the given fish.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing information about bite times for the given fish.
   */
  public getBiteTimes = (fishId?: number, spotId?: number) => {
    return this.biteFishSpotQuery.fetch({ variables: { fishId, spotId }, ...qOpts });
  };

  /**
   * Creates an observable that contains aggregate statistics about the given fish.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing aggregate statistics about the given fish.
   */
  public getStatisticsByFishId = (fishId: number, spotId?: number) => {
    return this.statFishSpotQuery.fetch({ variables: { fishId, spotId }, ...qOpts });
  };

  /**
   * Creates an observable that contains information about the weathers a fish can be caught during.
   *
   * @param fishId The fish id to query for.
   * @param spotId The spot id to filter by.
   * @returns An apollo result observable containing information about the weathers a fish can be caught during.
   */
  public getWeather = (fishId?: number, spotId?: number) => {
    return this.weathersFishSpotQuery.fetch({ variables: { fishId, spotId }, ...qOpts });
  };

  /**
   * Creates an observable that contains information about user statistics for the given fish.
   *
   * @param fishId The fish id to query for.
   * @returns An apollo result observable containing information about user statistics for the given fish.
   */
  public getRankingByFishId = (fishId: number) => {
    return this.auth.userId$.pipe(switchMap((userId) => this.rankingFishQuery.fetch({ variables: { fishId, userId }, ...qOpts })));
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

  public getTrainStatsSnapshot(trainId: string): Observable<any> {
    const reportsQuery = gql`query FishTrainReportsSnapshot($trainId: String!) {
      fishingresults(where: {trainId: {_eq: $trainId}}) {
        itemId,
        date,
        userId,
        baitId,
        mooch,
        size
      }
    }`;
    return this.apollo.query<any>({
      query: reportsQuery,
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
