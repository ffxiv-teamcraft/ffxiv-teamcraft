import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { SeoService } from '../../../core/seo/seo.service';
import { debounceTime, distinctUntilChanged, filter, map, shareReplay, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import gql from 'graphql-tag';
import { weatherIndex } from '../../../core/data/sources/weather-index';
import { mapIds } from '../../../core/data/sources/map-ids';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { Apollo } from 'apollo-angular';
import { WeatherService } from '../../../core/eorzea/weather.service';

@Component({
  selector: 'app-fishing-spot',
  templateUrl: './fishing-spot.component.html',
  styleUrls: ['./fishing-spot.component.less']
})
export class FishingSpotComponent extends TeamcraftPageComponent {

  public xivapiFishingSpot$: Observable<any>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public reloader$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  public gubalData$: Observable<any>;

  public loading = true;

  private highlightColor: number[] = [];

  public highlightedFish$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);

  public activeEntries$: Observable<any[]> = this.highlightedFish$.pipe(
    distinctUntilChanged(),
    debounceTime(100),
    map(fishId => {
      if (fishId <= 0) {
        return [];
      }
      return [
        {
          name: this.i18n.getName(this.l12n.getItem(fishId))
        }
      ];
    })
  );

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, public translate: TranslateService,
              private router: Router, private lazyData: LazyDataService, public settings: SettingsService,
              private etime: EorzeanTimeService, private apollo: Apollo, private weatherService: WeatherService,
              seo: SeoService) {
    super(seo);

    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug === null) {
        this.router.navigate(
          [this.i18n.getName(this.l12n.getPlace(this.lazyData.data.fishingSpots.find(s => s.id === +params.get('spotId')).zoneId)).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      } else if (slug !== this.i18n.getName(this.l12n.getPlace(this.lazyData.data.fishingSpots.find(s => s.id === +params.get('spotId')).zoneId)).split(' ').join('-')) {
        this.router.navigate(
          ['../', this.i18n.getName(this.l12n.getPlace(this.lazyData.data.fishingSpots.find(s => s.id === +params.get('spotId')).zoneId)).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      }
    });

    const spotId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('spotId'))
    );


    this.xivapiFishingSpot$ = spotId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.FishingSpot, +id);
      }),
      map(spot => {
        spot.customData = this.lazyData.data.fishingSpots.find(s => s.id === spot.ID);
        return spot;
      }),
      shareReplay(1)
    );

    this.links$ = this.xivapiFishingSpot$.pipe(
      map(() => {
        return [];
      })
    );

    this.highlightColor = this.settings.theme.highlight.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
      , (m, r, g, b) => '#' + r + r + g + g + b + b)
      .substring(1).match(/.{2}/g)
      .map(x => parseInt(x, 16));

    this.settings.themeChange$.subscribe(({ next }) => {
      this.highlightColor = next.highlight.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
        , (m, r, g, b) => '#' + r + r + g + g + b + b)
        .substring(1).match(/.{2}/g)
        .map(x => parseInt(x, 16));
    });

    this.gubalData$ = this.reloader$.pipe(
      switchMapTo(spotId$),
      switchMap((spotId) => {
        return combineLatest([
          this.xivapiFishingSpot$,
          this.apollo.query<any>({ query: this.getGraphQLQuery(+spotId), fetchPolicy: 'no-cache' })
        ]);
      }),
      switchMap(([spot, gubalData]) => {
        return this.etime.getEorzeanTime().pipe(
          distinctUntilChanged((a, b) => a.getUTCHours() % 8 === b.getUTCHours() % 8),
          map(time => {
            return [spot, gubalData, time];
          })
        );
      }),
      map(([spot, gubalData, time]) => {
        const hours = Array.from(Array(24).keys());
        return {
          weathers: weatherIndex[spot.TerritoryType.WeatherRate]
            .map(row => {
              return {
                chances: 100 * this.getWeatherChances(spot.TerritoryType.MapTargetID, row.weatherId),
                next: this.etime.toEarthDate(this.weatherService.getNextWeatherStart(spot.TerritoryType.MapTargetID, row.weatherId, time.getTime())),
                weatherId: row.weatherId,
                active: this.weatherService.getWeather(spot.TerritoryType.MapTargetID, time.getTime()) === row.weatherId
              };
            })
            .sort((a, b) => {
              if (a.active) {
                return -1;
              }
              if (b.active) {
                return 1;
              }
              return a.next - b.next;
            }),
          weatherTransitions: [].concat.apply([], weatherIndex[spot.TerritoryType.WeatherRate]
            .map(row => {
              return weatherIndex[spot.TerritoryType.WeatherRate].map(from => {
                return {
                  chances: 100 * this.getWeatherChances(spot.TerritoryType.MapTargetID, row.weatherId) * this.getWeatherChances(spot.TerritoryType.MapTargetID, from.weatherId),
                  next: this.etime.toEarthDate(this.weatherService.getNextWeatherTransition(
                    spot.TerritoryType.MapTargetID,
                    [from.weatherId],
                    row.weatherId,
                    time.getTime()
                  )),
                  weatherId: row.weatherId,
                  previousWeatherId: from.weatherId,
                  active: this.weatherService.getWeather(spot.TerritoryType.MapTargetID, time.getTime()) === row.weatherId
                    && this.weatherService.getWeather(spot.TerritoryType.MapTargetID, time.getTime() - 8 * 60 * 60 * 1000 - 1) === from.weatherId
                };
              });
            })
          ).sort((a, b) => {
            if (a.active) {
              return -1;
            }
            if (b.active) {
              return 1;
            }
            return a.next - b.next;
          }),
          fishesPerHourChart: {
            data: spot.customData.fishes
              .filter(fish => fish > 0)
              .map(fish => {
                return {
                  name: this.i18n.getName(this.l12n.getItem(fish)),
                  series: hours
                    .map(hour => {
                      const row = gubalData.data.etimes_per_fish_per_spot.find(r => r.itemId === fish && r.etime === hour);
                      return {
                        name: `${hour}:00`,
                        value: row ? row.occurences : 0
                      };
                    })
                };
              })
          },
          fishes: this.lazyData.data.fishingSpots.find(s => s.id === spot.ID).fishes.filter(f => f > 0),
          fishesPerBait: this.dataToTable(gubalData.data.baits_per_fish_per_spot.sort((a, b) => {
            return spot.customData.fishes.indexOf(a.itemId) - spot.customData.fishes.indexOf(b.itemId);
          }), 'itemId', 'baitId', 'occurences'),
          fishesPerWeather: this.dataToTable(gubalData.data.weathers_per_fish_per_spot.sort((a, b) => {
            return spot.customData.fishes.indexOf(a.itemId) - spot.customData.fishes.indexOf(b.itemId);
          }), 'itemId', 'weatherId', 'occurences'),
          fishesPerTug: this.dataToTable(gubalData.data.tug_per_fish_per_spot.sort((a, b) => {
            return spot.customData.fishes.indexOf(a.itemId) - spot.customData.fishes.indexOf(b.itemId);
          }), 'itemId', 'tug', 'occurences')
        };
      }),
      switchMap((display: any) => {
        return this.highlightedFish$.pipe(
          map(highlightedFish => {
            display.highlighted = highlightedFish;
            if (highlightedFish > -1) {
              display.highlightedIndex = display.fishes.findIndex(h => h === highlightedFish);
            } else {
              display.highlightedIndex = -1;
            }
            return display;
          })
        );
      }),
      tap(() => {
        this.loading = false;
      })
    );
  }

  public onChartHover(event: any, spot: any): void {
    const itemId = spot.customData.fishes.find(fish => {
      return this.i18n.getName(this.l12n.getItem(fish)) === event.value.name;
    });
    this.highlightedFish$.next(itemId);
  }

  private getGraphQLQuery(spotId: number): any {
    return gql`
          query fishData {
            etimes_per_fish_per_spot(where: {spot: {_eq: ${spotId}}}) {
              etime,
              occurences,
              itemId
            }
            baits_per_fish_per_spot(where: {spot: {_eq: ${spotId}}}) {
              baitId,
              occurences,
              itemId
            }
            tug_per_fish_per_spot(where: {spot: {_eq: ${spotId}}}) {
              tug,
              occurences,
              itemId
            }
            bite_time_per_fish_per_spot(where: {spot: {_eq: ${spotId}}}) {
              biteTime,
              occurences,
              itemId
            }
            weathers_per_fish_per_spot(where: {spot: {_eq: ${spotId}}}) {
              weatherId,
              occurences,
              itemId
            }
          }
        `;
  }

  private dataToTable(data: any[], headerProperty: string, siderProperty: string, valueProperty: string): { headers: number[], siders: number[], total: number, totals: number[], data: number[][] } {
    const res = data.reduce((result, row) => {
      let headerIndex = result.headers.findIndex(r => r === row[headerProperty]);
      if (headerIndex === -1) {
        result.headers.push(row[headerProperty]);
        headerIndex = result.headers.length - 1;
      }
      let siderIndex = result.siders.findIndex(r => r === row[siderProperty]);
      if (siderIndex === -1) {
        result.siders.push(row[siderProperty]);
        siderIndex = result.siders.length - 1;
      }
      result.data[siderIndex] = result.data[siderIndex] || [];
      result.data[siderIndex][headerIndex] = row[valueProperty];
      result.total += row[valueProperty];
      result.totals[siderIndex] = (result.totals[siderIndex] || 0) + row[valueProperty];
      return result;
    }, { headers: [], siders: [], data: [[]], total: 0, totals: [] });

    res.data.forEach(row => {
      if (row.length !== res.headers.length) {
        row.push(...new Array(res.headers.length - row.length));
      }
    });
    return res;
  }

  private getColor(weight: number): string {
    return `rgba(${this.highlightColor[0]}, ${this.highlightColor[1]}, ${this.highlightColor[2]}, ${Math.floor(weight * 90) / 100})`;
  }

  private getWeatherChances(mapId: number, weatherId: number): number {
    const index = weatherIndex[mapIds.find(m => m.id === mapId).weatherRate];
    const maxRate = index[index.length - 1].rate;
    const matchingIndex = index.findIndex(row => row.weatherId === weatherId);
    if (matchingIndex === 0) {
      return index[matchingIndex].rate / maxRate;
    }
    return (index[matchingIndex].rate - index[matchingIndex - 1].rate) / maxRate;
  }

  private getName(spot: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return spot.PlaceName[`Name_${this.translate.currentLang}`] || spot.Name_en;
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.xivapiFishingSpot$.pipe(
      map(fishingSpot => {
        return {
          title: this.getName(fishingSpot),
          description: '',
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/fishing-spot/${fishingSpot.ID}/${this.getName(fishingSpot).split(' ').join('-')}`,
          image: `https://cdn.ffxivteamcraft.com/assets/icons/classjob/fisher.png`
        };
      })
    );
  }

}
