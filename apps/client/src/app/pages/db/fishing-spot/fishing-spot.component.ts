import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { SeoService } from '../../../core/seo/seo.service';
import { distinctUntilChanged, filter, map, shareReplay, switchMap, switchMapTo, tap, withLatestFrom } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { fishingSpots } from '../../../core/data/sources/fishing-spots';
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

  public highlightTime$ = this.etime.getEorzeanTime().pipe(
    distinctUntilChanged((a, b) => a.getUTCHours() === b.getUTCHours()),
    map(time => {
      return [{
        name: `${time.getUTCHours()}:00`,
        value: this.settings.theme.highlight
      }];
    })
  );

  public loading = true;

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
          [this.i18n.getName(this.l12n.getPlace(fishingSpots.find(s => s.id === +params.get('spotId')).zoneId)).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      } else if (slug !== this.i18n.getName(this.l12n.getPlace(fishingSpots.find(s => s.id === +params.get('spotId')).zoneId)).split(' ').join('-')) {
        this.router.navigate(
          ['../', this.i18n.getName(this.l12n.getPlace(fishingSpots.find(s => s.id === +params.get('spotId')).zoneId)).split(' ').join('-')],
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
        spot.customData = fishingSpots.find(s => s.id === spot.ID);
        return spot;
      }),
      shareReplay(1)
    );

    this.links$ = this.xivapiFishingSpot$.pipe(
      map(() => {
        return [];
      })
    );

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
          fishes: fishingSpots.find(s => s.id === spot.ID).fishes.filter(f => f > 0)
        };
      }),
      tap((data) => {
        this.loading = false;
      })
    );
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
            hooksets_per_fish_per_spot(where: {spot: {_eq: ${spotId}}, hookset: {_neq: 0}}) {
              hookset,
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
            snagging_per_fish_per_spot(where: {spot: {_eq: ${spotId}}}) {
              snagging,
              occurences,
              itemId
            }
            fish_eyes_per_fish_per_spot(where: {spot: {_eq: ${spotId}}}) {
              fishEyes,
              occurences,
              itemId
            }
            weathers_per_fish_per_spot(where: {spot: {_eq: ${spotId}}}) {
              weatherId,
              occurences,
              itemId
            }
            weather_transitions_per_fish_per_spot(where: {spot: {_eq: ${spotId}}}) {
              previousWeatherId,
              weatherId,
              occurences,
              itemId
            }
          }
        `;
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
