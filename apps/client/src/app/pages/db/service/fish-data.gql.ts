import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import gql from 'graphql-tag';

interface FishIdVariable {
  fishId: number;
}

interface FishIdSpotIdVariable {
  fishId?: number;
  spotId?: number;
}

interface FishIdSpotIdMissesVariable {
  fishId?: number;
  spotId?: number;
  misses?: -2 | 1;
}

interface FishIdSpotIdWeathersVariable {
  fishId?: number;
  spotId?: number;
  $weatherIds?: number[];
}

interface FishSpot {
  spot: number;
  itemId: number;
}

interface FishSpotsResult {
  spots: FishSpot[];
}

@Injectable()
export class SpotsPerFishQuery extends Query<FishSpotsResult, FishIdVariable> {
  public document = gql`
    query SpotsPerFishQuery($fishId: Int!) {
      spots: spots_per_fish(where: { itemId: { _eq: $fishId } }) {
        spot
        itemId
      }
    }
  `;
}

interface FishEorzeaTime {
  itemId: number;
  spot: number;
  etime: number;
  occurences: number;
  fishEyes: boolean;
}

interface FishEorzeaTimeResult {
  etimes: FishEorzeaTime[];
}

@Injectable()
export class EorzeaTimesPerFishPerSpotQuery extends Query<FishEorzeaTimeResult, FishIdSpotIdVariable> {
  public document = gql`
    query EorzeaTimesPerFishPerSpotQuery($fishId: Int, $spotId: Int) {
      etimes: etimes_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId }, occurences: { _gt: 1 } }) {
        itemId
        spot
        etime
        occurences
        fishEyes
      }
    }
  `;
}

interface FishBait {
  itemId: number;
  spot: number;
  baitId: number;
  occurences: number;
}

interface FishMooch {
  itemId: number;
  spot: number;
  baitId: number;
}

interface FishBaitResult {
  baits: FishBait[];
  mooches: FishMooch[];
}

@Injectable()
export class BaitsPerFishPerSpotQuery extends Query<FishBaitResult, FishIdSpotIdMissesVariable> {
  public document = gql`
    query BaitsPerFishPerSpotQuery($fishId: Int, $spotId: Int, $misses: Int) {
      baits: baits_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId, _gt: $misses }, occurences: { _gt: 1 } }) {
        itemId
        spot
        baitId
        occurences
      }
      mooches: baits_per_fish_per_spot(where: { spot: { _eq: $spotId }, baitId: { _eq: $fishId, _gt: $misses }, occurences: { _gt: 1 } }) {
        itemId
        spot
        baitId
      }
    }
  `;
}

interface FishHookset {
  itemId: number;
  spot: number;
  hookset: number;
  occurences: number;
}

interface FishTug {
  itemId: number;
  spot: number;
  tug: number;
  occurences: number;
}

interface FishHooksetTugResult {
  hooksets: FishHookset[];
  tugs: FishTug[];
}

@Injectable()
export class HooksetTugsPerFishPerSpotQuery extends Query<FishHooksetTugResult, FishIdSpotIdVariable> {
  public document = gql`
    query HooksetTugsPerFishPerSpotQuery($fishId: Int, $spotId: Int) {
      hooksets: hooksets_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId }, hookset: { _neq: 0 }, occurences: { _gt: 1 } }) {
        itemId
        spot
        hookset
        occurences
      }
      tugs: tug_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId }, occurences: { _gt: 1 } }) {
        itemId
        spot
        tug
        occurences
      }
    }
  `;
}

interface FishBiteTime {
  itemId: number;
  spot: number;
  flooredBiteTime: number;
  occurences: number;
}

interface FishBiteTimeResult {
  biteTimes: FishBiteTime[];
}

@Injectable()
export class BiteTimesPerFishPerSpotQuery extends Query<FishBiteTimeResult, FishIdSpotIdVariable> {
  public document = gql`
    query BiteTimesPerFishPerSpotQuery($fishId: Int, $spotId: Int) {
      biteTimes: bite_time_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId }, flooredBiteTime: { _gt: 1, _lt: 600 }, occurences: { _gte: 3 } }) {
        itemId
        spot
        flooredBiteTime
        occurences
      }
    }
  `;
}

interface FishBiteTimePerBait {
  itemId: number;
  spot: number;
  baitId: number;
  flooredBiteTime: number;
  occurences: number;
}

interface FishBiteTimePerBaitResult {
  biteTimes: FishBiteTimePerBait[];
}

@Injectable()
export class BiteTimesPerFishPerSpotPerBaitQuery extends Query<FishBiteTimePerBaitResult, FishIdSpotIdVariable & { baitId?: number }> {
  public document = gql`
    query BiteTimesPerFishPerSpotPerBaitQuery($fishId: Int, $spotId: Int, $baitId: Int) {
      biteTimes: bite_time_per_fish_per_spot_per_bait(
        where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId }, baitId: { _eq: $baitId }, flooredBiteTime: { _gt: 1, _lt: 600 }, occurences: { _gte: 3 } }
      ) {
        itemId
        spot
        baitId
        flooredBiteTime
        occurences
      }
    }
  `;
}

interface FishSnagging {
  itemId: number;
  spot: number;
  snagging: boolean;
  occurences: number;
}

interface FishStatistics {
  aggregate: {
    min: {
      size: number;
      gathering: number;
    };
    max: {
      size: number;
    };
    avg: {
      size: number;
    };
  };
}

interface FishStatisticsResult {
  snagging: FishSnagging[];
  stats: FishStatistics;
}

@Injectable()
export class FishStatisticsPerFishPerSpotQuery extends Query<FishStatisticsResult, FishIdSpotIdVariable> {
  public document = gql`
    query FishStatisticsPerFishPerSpotQuery($fishId: Int, $spotId: Int) {
      snagging: snagging_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId }, occurences: { _gt: 1 } }) {
        itemId
        spot
        snagging
        occurences
      }
      stats: fishingresults_aggregate(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId }}) {
        aggregate {
          min {
            size
            gathering
          }
          max {
            size
          }
          avg {
            size
          }
        }
      }
    }
  `;
}

interface FishWeather {
  itemId: number;
  spot: number;
  weatherId: number;
  occurences: number;
}

interface FishWeatherTransition extends FishWeather {
  previousWeatherId: number;
}

interface FishWeatherResult {
  weathers: FishWeather[];
  weatherTransitions: FishWeatherTransition[];
}

@Injectable()
export class WeathersPerFishPerSpotQuery extends Query<FishWeatherResult, FishIdSpotIdWeathersVariable> {
  public document = gql`
    query WeathersPerFishPerSpotQuery($fishId: Int, $spotId: Int, $weatherIds: [Int]) {
      weathers: weathers_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId }, occurences: { _gt: 1 }, weatherId: {_in: $weatherIds} }) {
        itemId
        spot
        weatherId
        occurences
      }
      weatherTransitions: weather_transitions_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId }, occurences: { _gt: 1 }, weatherId: {_in: $weatherIds} }) {
        itemId
        spot
        weatherId
        previousWeatherId
        occurences
      }
    }
  `;
}

interface FishRanking {
  itemId: number;
  size: number;
  userId: string;
  date: string;
  baitId: number;
  ranking: {
    rank: number;
  };
}

interface FishRankingResult {
  rankings: FishRanking[];
  userRanking: [FishRanking | undefined];
}

interface FishRankingVariable extends FishIdVariable {
  userId: string;
}

@Injectable()
export class RankingPerFishQuery extends Query<FishRankingResult, FishRankingVariable> {
  public document = gql`
    query RankingPerFishQuery($fishId: Int, $userId: String!) {
      rankings: fishingresults(where: { itemId: { _eq: $fishId }, ranking: { rank: { _lte: 3 } } }, order_by: { ranking: { rank: asc } }, limit: 10) {
        itemId
        size
        userId
        date
        baitId
        ranking {
          rank
        }
      }
      userRanking: fishingresults(where: { itemId: { _eq: $fishId }, userId: { _eq: $userId } }, order_by: { ranking: { rank: asc } }, limit: 1) {
        itemId
        size
        userId
        date
        baitId
        ranking {
          rank
        }
      }
    }
  `;
}
