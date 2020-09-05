import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, forkJoin, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { SeoService } from '../../../core/seo/seo.service';
import { debounceTime, distinctUntilChanged, filter, map, shareReplay, switchMap, switchMapTo, tap, takeUntil, first } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import gql from 'graphql-tag';
import { weatherIndex } from '../../../core/data/sources/weather-index';
import { mapIds } from '../../../core/data/sources/map-ids';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { Apollo } from 'apollo-angular';
import { WeatherService } from '../../../core/eorzea/weather.service';
import { NzModalService } from 'ng-zorro-antd';
import { FishingMissesPopupComponent } from '../fishing-misses-popup/fishing-misses-popup.component';
import { groupBy } from 'lodash';
import { LocalizedLazyDataService } from '../../../core/data/localized-lazy-data.service';
import { FishContextService } from '../service/fish-context.service';

@Component({
  selector: 'app-fishing-spot',
  templateUrl: './fishing-spot.component.html',
  styleUrls: ['./fishing-spot.component.less', '../fish/fish.common.less', '../common-db.less'],
})
export class FishingSpotComponent extends TeamcraftPageComponent implements OnInit, OnDestroy {
  private readonly spotId$ = this.route.paramMap.pipe(
    filter((params) => params.get('slug') !== null),
    map((params) => params.get('spotId'))
  );

  public readonly xivapiFishingSpot$: Observable<any> = this.spotId$.pipe(
    switchMap((id) => {
      return this.xivapi.get(XivapiEndpoint.FishingSpot, +id);
    }),
    map((spot) => {
      spot.customData = this.lazyData.data.fishingSpots.find((s) => s.id === spot.ID);
      if (spot.TerritoryType === null && spot.ID >= 10000) {
        spot.TerritoryType = this.lazyData.data.diademTerritory;
      }
      return spot;
    }),
    shareReplay(1)
  );

  public links$: Observable<{ title: string; icon: string; url: string }[]> = this.xivapiFishingSpot$.pipe(
    map(() => {
      return [];
    })
  );
  public reloader$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  public gubalData$: Observable<any> = this.reloader$.pipe(
    switchMapTo(this.spotId$),
    switchMap((spotId) => {
      return combineLatest([this.xivapiFishingSpot$, this.apollo.query<any>({ query: this.getGraphQLQuery(+spotId), fetchPolicy: 'no-cache' })]);
    }),
    switchMap(([spot, gubalData]) => {
      return this.etime.getEorzeanTime().pipe(
        distinctUntilChanged((a, b) => a.getUTCHours() % 8 === b.getUTCHours() % 8),
        map((time) => {
          return [spot, gubalData, time];
        })
      );
    }),
    map(([spot, gubalData, time]) => {
      const hours = Array.from(Array(24).keys());
      const biteTimeGraphs: { [index: number]: any[] } = {};
      biteTimeGraphs[0] = spot.customData.fishes
        .filter((fish) => fish > 0)
        .map((fish) => {
          return {
            name: this.i18n.getName(this.l12n.getItem(fish)),
            series: Object.keys(groupBy(gubalData.data.bite_time_per_fish_per_spot, 'biteTime')).map((biteTime) => {
              const row = gubalData.data.bite_time_per_fish_per_spot.find((r) => r.itemId === fish && r.biteTime === +biteTime);
              return {
                name: biteTime,
                value: row ? row.occurences : 0,
              };
            }),
          };
        });
      const groupedBaits = groupBy(gubalData.data.bite_time_per_fish_per_spot_per_bait, 'baitId');
      const biteTimeBaits = Object.keys(groupedBaits).map((key) => +key);
      Object.entries<any>(groupedBaits)
        .filter(([baitId]) => +baitId > 0)
        .forEach(([baitId, baitRow]) => {
          biteTimeGraphs[+baitId] = spot.customData.fishes
            .filter((fish) => fish > 0)
            .map((fish) => {
              return {
                name: this.i18n.getName(this.l12n.getItem(fish)),
                series: Object.keys(groupBy(baitRow, 'biteTime')).map((biteTime) => {
                  const rows = gubalData.data.bite_time_per_fish_per_spot_per_bait.filter(
                    (r) => r.itemId === fish && r.biteTime === +biteTime && r.baitId === +baitId
                  );
                  return {
                    name: biteTime,
                    value: rows.reduce((acc, row) => acc + row.occurences, 0),
                  };
                }),
              };
            });
        });
      return {
        weathers: (weatherIndex[spot.TerritoryType.WeatherRate] || [])
          .map((row) => {
            return {
              chances: 100 * this.getWeatherChances(spot.TerritoryType.MapTargetID, row.weatherId),
              next: this.etime.toEarthDate(this.weatherService.getNextWeatherStart(spot.TerritoryType.MapTargetID, row.weatherId, time.getTime())),
              weatherId: row.weatherId,
              active: this.weatherService.getWeather(spot.TerritoryType.MapTargetID, time.getTime()) === row.weatherId,
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
        weatherTransitions: [].concat
          .apply(
            [],
            (weatherIndex[spot.TerritoryType.WeatherRate] || []).map((row) => {
              return weatherIndex[spot.TerritoryType.WeatherRate].map((from) => {
                return {
                  chances:
                    100 *
                    this.getWeatherChances(spot.TerritoryType.MapTargetID, row.weatherId) *
                    this.getWeatherChances(spot.TerritoryType.MapTargetID, from.weatherId),
                  next: this.etime.toEarthDate(
                    this.weatherService.getNextWeatherTransition(spot.TerritoryType.MapTargetID, [from.weatherId], row.weatherId, time.getTime())
                  ),
                  weatherId: row.weatherId,
                  previousWeatherId: from.weatherId,
                  active:
                    this.weatherService.getWeather(spot.TerritoryType.MapTargetID, time.getTime()) === row.weatherId &&
                    this.weatherService.getWeather(spot.TerritoryType.MapTargetID, time.getTime() - 8 * 60 * 60 * 1000 - 1) === from.weatherId,
                };
              });
            })
          )
          .sort((a, b) => {
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
            .filter((fish) => fish > 0)
            .map((fish) => {
              return {
                name: this.i18n.getName(this.l12n.getItem(fish)),
                series: hours.map((hour) => {
                  const row = gubalData.data.etimes_per_fish_per_spot.find((r) => r.itemId === fish && r.etime === hour);
                  return {
                    name: `${hour}:00`,
                    value: row ? row.occurences : 0,
                  };
                }),
              };
            }),
        },
        biteTimesPerBait: {
          baits: [...biteTimeBaits],
          graphs: biteTimeGraphs,
        },
        fishes: this.lazyData.data.fishingSpots.find((s) => s.id === spot.ID).fishes.filter((f) => f > 0),
        fishesPerBait: this.dataToTable(
          gubalData.data.baits_per_fish_per_spot.sort((a, b) => {
            return spot.customData.fishes.indexOf(a.itemId) - spot.customData.fishes.indexOf(b.itemId);
          }),
          'itemId',
          'baitId',
          'occurences'
        ),
        fishesPerWeather: this.dataToTable(
          gubalData.data.weathers_per_fish_per_spot.sort((a, b) => {
            return spot.customData.fishes.indexOf(a.itemId) - spot.customData.fishes.indexOf(b.itemId);
          }),
          'itemId',
          'weatherId',
          'occurences'
        ),
        fishesPerTug: this.dataToTable(
          gubalData.data.tug_per_fish_per_spot.sort((a, b) => {
            return spot.customData.fishes.indexOf(a.itemId) - spot.customData.fishes.indexOf(b.itemId);
          }),
          'itemId',
          'tug',
          'occurences'
        ),
      };
    }),
    switchMap((display: any) => {
      return this.highlightedFish$.pipe(
        map((highlightedFish) => {
          display.highlighted = highlightedFish;
          if (highlightedFish > -1) {
            display.highlightedIndex = display.fishes.findIndex((h) => h === highlightedFish);
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

  public loading = true;

  private highlightColor: number[] = this.settings.theme.highlight
    .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16));

  public highlightedFish$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);

  selectedBait = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly xivapi: XivapiService,
    private readonly l12n: LocalizedDataService,
    private readonly l12nLazy: LocalizedLazyDataService,
    private readonly i18n: I18nToolsService,
    public readonly translate: TranslateService,
    private readonly router: Router,
    private readonly lazyData: LazyDataService,
    public readonly settings: SettingsService,
    private readonly etime: EorzeanTimeService,
    private readonly apollo: Apollo,
    private readonly weatherService: WeatherService,
    private readonly dialog: NzModalService,
    private readonly fishContext: FishContextService,
    readonly seo: SeoService
  ) {
    super(seo);
  }

  ngOnInit() {
    super.ngOnInit();

    this.settings.themeChange$.pipe(takeUntil(this.onDestroy$)).subscribe(({ next }) => {
      this.highlightColor = next.highlight
        .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
        .substring(1)
        .match(/.{2}/g)
        .map((x) => parseInt(x, 16));
    });

    combineLatest([this.route.paramMap, this.lazyData.fishingSpots$])
      .pipe(
        takeUntil(this.onDestroy$),
        switchMap(([params, fishingSpots]) => {
          const slug$ = of(params.get('slug') ?? undefined);
          const _spotId = +params.get('spotId') >= 0 ? +params.get('spotId') : undefined;
          const zoneId = fishingSpots.find((spot) => spot.id === _spotId)?.zoneId;
          const spotId$ = of(_spotId);
          const correctSlug$ =
            zoneId >= 0 ? this.i18n.resolveName(this.l12nLazy.getPlace(zoneId)).pipe(map((name) => name.split(' ')?.join('-'))) : of(undefined);
          return combineLatest([slug$, spotId$, correctSlug$]).pipe(
            debounceTime(100),
            map(([slug, itemId, correctSlug]) => ({ slug, itemId, correctSlug }))
          );
        })
      )
      .subscribe(this.onRouteParams);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.fishContext.setSpotId(undefined);
  }

  public onChartHover(event: any, spot: any): void {
    const itemId = spot.customData.fishes.find((fish) => {
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
            bite_time_per_fish_per_spot(where: {spot: {_eq: ${spotId}}, biteTime: {_gt: 1}, occurences: {_gte: 3}}) {
              biteTime,
              occurences,
              itemId
            }
            bite_time_per_fish_per_spot_per_bait(where: {spot: {_eq: ${spotId}}, biteTime: {_gt: 1}, occurences: {_gte: 3}}) {
              biteTime,
              occurences,
              itemId,
              baitId
            }
            weathers_per_fish_per_spot(where: {spot: {_eq: ${spotId}}}) {
              weatherId,
              occurences,
              itemId
            }
          }
        `;
  }

  private dataToTable(
    data: any[],
    headerProperty: string,
    siderProperty: string,
    valueProperty: string
  ): { headers: number[]; siders: number[]; total: number; totals: number[]; data: number[][] } {
    const res = data.reduce(
      (result, row) => {
        let headerIndex = result.headers.findIndex((r) => r === row[headerProperty]);
        if (headerIndex === -1) {
          result.headers.push(row[headerProperty]);
          headerIndex = result.headers.length - 1;
        }
        let siderIndex = result.siders.findIndex((r) => r === row[siderProperty]);
        if (siderIndex === -1) {
          result.siders.push(row[siderProperty]);
          siderIndex = result.siders.length - 1;
        }
        result.data[siderIndex] = result.data[siderIndex] || [];
        result.data[siderIndex][headerIndex] = row[valueProperty];
        result.total += row[valueProperty];
        result.totals[siderIndex] = (result.totals[siderIndex] || 0) + row[valueProperty];
        return result;
      },
      { headers: [], siders: [], data: [[]], total: 0, totals: [] }
    );

    res.data.forEach((row) => {
      if (row.length !== res.headers.length) {
        row.push(...new Array(res.headers.length - row.length));
      }
    });
    return res;
  }

  private getColor(weight: number): string {
    return `rgba(${this.highlightColor[0]}, ${this.highlightColor[1]}, ${this.highlightColor[2]}, ${Math.floor(weight * 90) / 100})`;
  }

  public showMissesPopup(spotId: number): void {
    this.dialog.create({
      nzTitle: `${this.translate.instant('DB.FISH.Misses_popup_title')}`,
      nzContent: FishingMissesPopupComponent,
      nzComponentParams: {
        spotId: spotId,
      },
      nzFooter: null,
      nzWidth: '80vw',
    });
  }

  private getWeatherChances(mapId: number, weatherId: number): number {
    const index = weatherIndex[mapIds.find((m) => m.id === mapId).weatherRate];
    const maxRate = index[index.length - 1].rate;
    const matchingIndex = index.findIndex((row) => row.weatherId === weatherId);
    if (matchingIndex === 0) {
      return index[matchingIndex].rate / maxRate;
    }
    return (index[matchingIndex].rate - index[matchingIndex - 1].rate) / maxRate;
  }

  private getName(spot: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(this.l12n.xivapiToI18n(spot.PlaceName, 'places'));
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.xivapiFishingSpot$.pipe(
      map((fishingSpot) => {
        return {
          title: this.getName(fishingSpot),
          description: '',
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/fishing-spot/${fishingSpot.ID}/${this.getName(fishingSpot).split(' ').join('-')}`,
          image: `https://cdn.ffxivteamcraft.com/assets/icons/classjob/fisher.png`,
        };
      })
    );
  }

  private readonly onRouteParams = ({ slug, spotId, correctSlug }: { slug?: string; spotId?: number; correctSlug?: string }) => {
    this.fishContext.setSpotId(spotId);
    if (!correctSlug) return;
    if (slug === undefined) {
      this.router.navigate([correctSlug], {
        relativeTo: this.route,
        replaceUrl: true,
      });
    } else if (slug !== correctSlug) {
      this.router.navigate(['../', correctSlug], {
        relativeTo: this.route,
        replaceUrl: true,
      });
    }
  };
}
