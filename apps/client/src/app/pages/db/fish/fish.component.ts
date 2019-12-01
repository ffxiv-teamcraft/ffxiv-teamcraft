import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { distinctUntilChanged, map, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { SettingsService } from '../../../modules/settings/settings.service';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import * as shape from 'd3-shape';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { fishingSpots } from '../../../core/data/sources/fishing-spots';
import { Router } from '@angular/router';
import { fishes } from '../../../core/data/sources/fishes';

@Component({
  selector: 'app-fish',
  templateUrl: './fish.component.html',
  styleUrls: ['./fish.component.less']
})
export class FishComponent implements OnInit {

  public loading = true;

  public xivapiFish$: ReplaySubject<any> = new ReplaySubject<any>();

  @Input()
  public set xivapiFish(fish: any) {
    this.loading = true;
    this.xivapiFish$.next(fish);
  }

  @Input()
  usedForTpl: TemplateRef<any>;

  public reloader$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  public gubalData$: Observable<any>;

  public highlightTime$ = this.etime.getEorzeanTime().pipe(
    distinctUntilChanged((a, b) => a.getUTCHours() === b.getUTCHours()),
    map(time => {
      return [{
        name: `${time.getUTCHours()}:00`,
        value: this.settings.theme.highlight
      }];
    })
  );

  constructor(private l12n: LocalizedDataService, private i18n: I18nToolsService,
              private translate: TranslateService, private lazyData: LazyDataService,
              public settings: SettingsService, private apollo: Apollo,
              private etime: EorzeanTimeService, private router: Router) {
  }

  ngOnInit(): void {
    const fishId$ = this.xivapiFish$.pipe(map(fish => fish.ID));
    this.gubalData$ = this.reloader$.pipe(
      switchMapTo(fishId$),
      switchMap((fishId) => {
        const dataQuery = gql`
          query fishData {
            etimes_per_fish(where: {itemId: {_eq: ${fishId}}}) {
              etime
              occurences
            }
            baits_per_fish(where: {itemId: {_eq: ${fishId}}}) {
              baitId
              occurences
            }
            hooksets_per_fish(where:{itemId: {_eq: ${fishId}}, hookset: {_neq: 0}}) {
              hookset,
              occurences
            }
            tug_per_fish(where:{itemId: {_eq: ${fishId}}}) {
              tug,
              occurences
            }
            bite_time_per_fish(where:{itemId: {_eq: ${fishId}}}) {
              biteTime,
              occurences
            }
            snagging_per_fish(where:{itemId: {_eq: ${fishId}}}) {
              snagging,
              occurences
            }
            fish_eyes_per_fish(where:{itemId: {_eq: ${fishId}}}) {
              fishEyes,
              occurences
            }
            weathers_per_fish(where:{itemId: {_eq: ${fishId}}}) {
              weatherId,
              occurences
            }
            weather_transitions_per_fish(where:{itemId: {_eq: ${fishId}}}) {
              previousWeatherId,
              weatherId,
              occurences
            }
            spots_per_fish(where:{itemId: {_eq: ${fishId}}}) {
              spot
            }
            fishingresults_aggregate(where: {itemId: {_eq: ${fishId}}}) {
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
            used_for_mooch:baits_per_fish(where: {baitId: {_eq: ${fishId}}}) {
              itemId
            }
          }
        `;
        return this.apollo.query<any>({ query: dataQuery, fetchPolicy: 'no-cache' });
      }),
      map(result => {
        const hours = Array.from(Array(24).keys());
        const totalHooksets = result.data.hooksets_per_fish.reduce((acc, row) => acc + row.occurences, 0);
        const totalTugs = result.data.tug_per_fish.reduce((acc, row) => acc + row.occurences, 0);
        const totalSnagging = result.data.snagging_per_fish.reduce((acc, row) => acc + row.occurences, 0);
        const snaggingPercent = 100 * (result.data.snagging_per_fish.find(entry => {
          return entry.snagging === true;
        }) || {occurences: 0}).occurences / totalSnagging;
        const totalFishEyes = result.data.fish_eyes_per_fish.reduce((acc, row) => acc + row.occurences, 0);
        const fishEyesPercent = 100 * (result.data.fish_eyes_per_fish.find(entry => {
          return entry.fishEyes === true;
        }) || {occurences: 0}).occurences / totalFishEyes;
        const totalWeatherTransitions = result.data.weather_transitions_per_fish.reduce((acc, row) => acc + row.occurences, 0);
        const sortedBiteTimes = result.data.bite_time_per_fish.sort((a, b) => a.biteTime - b.biteTime);
        const sortedWeathers = result.data.weathers_per_fish.sort((a, b) => b.occurences - a.occurences);
        const sortedBaits = result.data.baits_per_fish
          .filter(entry => {
            return this.l12n.getItem(entry.baitId) !== undefined;
          })
          .sort((a, b) => {
            return b.occurences - a.occurences;
          });
        return {
          etimesChart: {
            view: [600, 300],
            data: hours.map(hour => {
              const match = result.data.etimes_per_fish.find(fish => fish.etime === hour);
              return match ? {
                name: `${match.etime}:00`,
                value: match.occurences
              } : {
                name: `${hour}:00`,
                value: 0
              };
            })
          },
          baitsChart: {
            view: [400, 250],
            data: sortedBaits
              .map(entry => {
                return {
                  itemId: entry.baitId,
                  name: this.i18n.getName(this.l12n.getItem(entry.baitId)),
                  value: entry.occurences
                };
              }),
            raw: sortedBaits
          },
          biteTimeChart: {
            view: [400, 300],
            data: [
              {
                name: '',
                series: sortedBiteTimes
                  .filter(entry => entry.occurences > 5)
                  .map(entry => {
                    return {
                      name: entry.biteTime / 10,
                      value: entry.occurences
                    };
                  })
              }
            ],
            curve: shape.curveBasisOpen,
            min: sortedBiteTimes[0].biteTime / 10,
            max: sortedBiteTimes[sortedBiteTimes.length - 1].biteTime / 10
          },
          weathersChart: {
            view: [400, 300],
            data: sortedWeathers.map(entry => {
              return {
                name: this.i18n.getName(this.l12n.getWeather(entry.weatherId)),
                value: entry.occurences
              };
            })
          },
          usedAsMoochFor: result.data.used_for_mooch,
          mooches: sortedBaits.filter(entry => fishes.includes(entry.baitId)),
          weatherTransitions: result.data.weather_transitions_per_fish
            .sort((a, b) => b.occurences - a.occurences)
            .map(entry => {
              entry.percent = 100 * entry.occurences / totalWeatherTransitions;
              return entry;
            }),
          hooksets: result.data.hooksets_per_fish
            .sort((a, b) => b.occurences - a.occurences)
            .map(entry => {
              entry.hookset = entry.hookset === 1 ? 4103 : 4179;
              entry.percent = 100 * entry.occurences / totalHooksets;
              return entry;
            }),
          tugs: result.data.tug_per_fish
            .sort((a, b) => b.occurences - a.occurences)
            .map(entry => {
              entry.tugName = ['Medium', 'Big', 'Light'][entry.tug];
              entry.percent = 100 * entry.occurences / totalTugs;
              return entry;
            }),
          snagging: snaggingPercent,
          fishEyes: fishEyesPercent,
          spots: result.data.spots_per_fish
            .map(entry => {
              entry.spotData = fishingSpots.find(row => row.id === entry.spot);
              return entry;
            }),
          minSize: result.data.fishingresults_aggregate.aggregate.min.size,
          maxSize: result.data.fishingresults_aggregate.aggregate.max.size,
          avgSize: result.data.fishingresults_aggregate.aggregate.avg.size,
          minGathering: result.data.fishingresults_aggregate.aggregate.min.gathering
        };
      }),
      tap(() => this.loading = false)
    );
  }
}
