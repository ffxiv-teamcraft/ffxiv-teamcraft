import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import gql from 'graphql-tag';

interface FishIdVariable {
  fishId: number;
}

interface FishIdSpotIdVariable {
  fishId: number;
  spotId: number;
}

interface FishSpot {
  spot: number;
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
      }
    }
  `;
}

interface FishEorzeaTime {
  etime: number;
  occurences: number;
}

interface FishEorzeaTimeResult {
  etimes: FishEorzeaTime[];
}

@Injectable()
export class EorzeaTimesPerFishQuery extends Query<FishEorzeaTimeResult, FishIdVariable> {
  public document = gql`
    query EorzeaTimesPerFishQuery($fishId: Int!) {
      etimes: etimes_per_fish(where: { itemId: { _eq: $fishId } }) {
        etime
        occurences
      }
    }
  `;
}

@Injectable()
export class EorzeaTimesPerFishPerSpotQuery extends Query<FishEorzeaTimeResult, FishIdSpotIdVariable> {
  public document = gql`
    query EorzeaTimesPerFishPerSpotQuery($fishId: Int!, $spotId: Int!) {
      etimes: etimes_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId } }) {
        etime
        occurences
      }
    }
  `;
}

interface FishBait {
  baitId: number;
  occurences: number;
}

interface FishMooch {
  itemId: number;
}

interface FishBaitResult {
  baits: FishBait[];
  mooches: FishMooch[];
}

@Injectable()
export class BaitsPerFishQuery extends Query<FishBaitResult, FishIdVariable> {
  public document = gql`
    query BaitsPerFishQuery($fishId: Int!) {
      baits: baits_per_fish(where: { itemId: { _eq: $fishId } }) {
        baitId
        occurences
      }
      mooches: baits_per_fish(where: { baitId: { _eq: $fishId } }) {
        itemId
      }
    }
  `;
}

@Injectable()
export class BaitsPerFishPerSpotQuery extends Query<FishBaitResult, FishIdSpotIdVariable> {
  public document = gql`
    query BaitsPerFishPerSpotQuery($fishId: Int!, $spotId: Int!) {
      baits: baits_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId } }) {
        baitId
        occurences
      }
      mooches: baits_per_fish_per_spot(where: { spot: { _eq: $spotId }, baitId: { _eq: $fishId } }) {
        itemId
      }
    }
  `;
}

interface FishHookset {
  hookset: number;
  occurences: number;
}

interface FishTug {
  tug: number;
  occurences: number;
}

interface FishHooksetTugResult {
  hooksets: FishHookset[];
  tugs: FishTug[];
}

@Injectable()
export class HooksetTugsPerFishQuery extends Query<FishHooksetTugResult, FishIdVariable> {
  public document = gql`
    query HooksetTugsPerFishQuery($fishId: Int!) {
      hooksets: hooksets_per_fish(where: { itemId: { _eq: $fishId } }) {
        hookset
        occurences
      }
      tugs: tug_per_fish(where: { itemId: { _eq: $fishId } }) {
        tug
        occurences
      }
    }
  `;
}

@Injectable()
export class HooksetTugsPerFishPerSpotQuery extends Query<FishHooksetTugResult, FishIdSpotIdVariable> {
  public document = gql`
    query HooksetTugsPerFishPerSpotQuery($fishId: Int!, $spotId: Int!) {
      hooksets: hooksets_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId } }) {
        hookset
        occurences
      }
      tugs: tug_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId } }) {
        tug
        occurences
      }
    }
  `;
}

interface FishBiteTime {
  biteTime: number;
  occurences: number;
}

interface FishBiteTimeResult {
  biteTimes: FishBiteTime[];
}

@Injectable()
export class BiteTimesPerFishQuery extends Query<FishBiteTimeResult, FishIdVariable> {
  public document = gql`
    query BiteTimesPerFishQuery($fishId: Int!) {
      biteTimes: bite_time_per_fish(where: { itemId: { _eq: $fishId } }) {
        biteTime
        occurences
      }
    }
  `;
}

@Injectable()
export class BiteTimesPerFishPerSpotQuery extends Query<FishBiteTimeResult, FishIdSpotIdVariable> {
  public document = gql`
    query BiteTimesPerFishPerSpotQuery($fishId: Int!, $spotId: Int!) {
      biteTimes: bite_time_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId } }) {
        biteTime
        occurences
      }
    }
  `;
}

interface FishSnagging {
  snagging: boolean;
  occurences: number;
}

interface FishEyesBuff {
  fishEyes: boolean;
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
  fishEyes: FishEyesBuff[];
  stats: FishStatistics;
}

@Injectable()
export class FishStatisticsPerFishQuery extends Query<FishStatisticsResult, FishIdVariable> {
  public document = gql`
    query FishStatisticsPerFishQuery($fishId: Int!) {
      snagging: snagging_per_fish(where: { itemId: { _eq: $fishId } }) {
        snagging
        occurences
      }
      fishEyes: fish_eyes_per_fish(where: { itemId: { _eq: $fishId } }) {
        fishEyes
        occurences
      }
      stats: fishingresults_aggregate(where: { itemId: { _eq: $fishId } }) {
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

@Injectable()
export class FishStatisticsPerFishPerSpotQuery extends Query<FishStatisticsResult, FishIdSpotIdVariable> {
  public document = gql`
    query FishStatisticsPerFishPerSpotQuery($fishId: Int!, $spotId: Int!) {
      snagging: snagging_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId } }) {
        snagging
        occurences
      }
      fishEyes: fish_eyes_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId } }) {
        fishEyes
        occurences
      }
      stats: fishingresults_aggregate(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId } }) {
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
export class WeathersPerFishQuery extends Query<FishWeatherResult, FishIdVariable> {
  public document = gql`
    query WeathersPerFishQuery($fishId: Int!) {
      weathers: weathers_per_fish(where: { itemId: { _eq: $fishId } }) {
        weatherId
        occurences
      }
      weatherTransitions: weather_transitions_per_fish(where: { itemId: { _eq: $fishId } }) {
        weatherId
        previousWeatherId
        occurences
      }
    }
  `;
}

@Injectable()
export class WeathersPerFishPerSpotQuery extends Query<FishWeatherResult, FishIdSpotIdVariable> {
  public document = gql`
    query WeathersPerFishPerSpotQuery($fishId: Int!, $spotId: Int!) {
      weathers: weathers_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId } }) {
        weatherId
        occurences
      }
      weatherTransitions: weather_transitions_per_fish_per_spot(where: { spot: { _eq: $spotId }, itemId: { _eq: $fishId } }) {
        weatherId
        previousWeatherId
        occurences
      }
    }
  `;
}

interface FishRanking {
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
    query RankingPerFishQuery($fishId: Int!, $userId: String!) {
      rankings: fishingresults(where: { itemId: { _eq: $fishId }, ranking: { rank: { _lte: 3 } } }, order_by: { ranking: { rank: asc } }, limit: 10) {
        size
        userId
        date
        baitId
        ranking {
          rank
        }
      }
      userRanking: fishingresults(where: { itemId: { _eq: $fishId }, userId: { _eq: $userId } }, order_by: { ranking: { rank: asc } }, limit: 1) {
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
