import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { NzModalService } from 'ng-zorro-antd';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, shareReplay, switchMap, takeUntil, tap, filter } from 'rxjs/operators';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { LocalizedLazyDataService } from '../../../core/data/localized-lazy-data.service';
import { mapIds } from '../../../core/data/sources/map-ids';
import { weatherIndex } from '../../../core/data/sources/weather-index';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { WeatherService } from '../../../core/eorzea/weather.service';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { SeoService } from '../../../core/seo/seo.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { FishingMissesPopupComponent } from '../fishing-misses-popup/fishing-misses-popup.component';
import { FishContextService } from '../service/fish-context.service';

// TODO: Type me
export type XivApiFishingSpot = any;

@Component({
  selector: 'app-fishing-spot',
  templateUrl: './fishing-spot.component.html',
  styleUrls: ['./fishing-spot.component.less', '../fish/fish.common.less', '../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FishingSpotComponent extends TeamcraftPageComponent implements OnInit, OnDestroy {
  private readonly loadingSub$ = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this.loadingSub$.pipe(distinctUntilChanged());

  public readonly xivapiFishingSpot$: Observable<XivApiFishingSpot> = this.fishContext.spotId$.pipe(
    filter((spotId) => spotId >= 0),
    switchMap((id) => {
      this.loadingSub$.next(true);
      return combineLatest([this.xivapi.get(XivapiEndpoint.FishingSpot, id), this.lazyData.fishingSpots$, this.lazyData.diademTerritory$]);
    }),
    map(([spot, allSpots, diademTerritory]) => {
      spot.customData = allSpots.find((s) => s.id === spot.ID);
      if (spot.TerritoryType === null && spot.ID >= 10000) {
        spot.TerritoryType = diademTerritory;
      }
      return spot;
    }),
    tap(() => this.loadingSub$.next(false)),
    shareReplay(1)
  );

  public gubalData$: Observable<any> = combineLatest([
    this.xivapiFishingSpot$,
    this.apollo.query<any>({ query: this.getGraphQLQuery(+1), fetchPolicy: 'no-cache' }),
  ]).pipe(
    switchMap(([spot, gubalData]) => {
      return this.etime.getEorzeanTime().pipe(
        distinctUntilChanged((a, b) => a.getUTCHours() % 8 === b.getUTCHours() % 8),
        map((time) => {
          return [spot, gubalData, time];
        })
      );
    }),
    map(([spot, gubalData, time]) => {
      return {
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
    })
  );

  public highlightedFish$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  private highlightColor$ = this.settings.themeChange$.pipe(
    map(({ next }) => {
      return next.highlight
        .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
        .substring(1)
        .match(/.{2}/g)
        .map((x) => parseInt(x, 16));
    })
  );

  public getHighlightColor(weight: number = 10) {
    return this.highlightColor$.pipe(
      takeUntil(this.onDestroy$),
      map((colors) => {
        return `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, ${Math.floor(weight * 90) / 100})`;
      })
    );
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly xivapi: XivapiService,
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
            map(([slug, spotId, correctSlug]) => ({ slug, spotId, correctSlug }))
          );
        })
      )
      .subscribe(this.onRouteParams);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.fishContext.setSpotId(undefined);
    this.fishContext.setBaitId(undefined);
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

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.xivapiFishingSpot$.pipe(
      switchMap((fishingSpot) => combineLatest([of(fishingSpot), this.i18n.resolveName(this.l12nLazy.xivapiToI18n(fishingSpot.PlaceName, 'places'))])),
      map(([fishingSpot, title]) => {
        return {
          title,
          description: '',
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/fishing-spot/${fishingSpot.ID}/${title.split(' ').join('-')}`,
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
