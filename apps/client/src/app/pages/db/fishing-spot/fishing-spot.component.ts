import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { SeoService } from '../../../core/seo/seo.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { SettingsService } from '../../../modules/settings/settings.service';
import { FishingMissesPopupComponent } from '../fishing-misses-popup/fishing-misses-popup.component';
import { FishContextService } from '../service/fish-context.service';
import { MapNamePipe } from '../../../pipes/pipes/map-name.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { FishingSpotBiteTimesComponent } from './fishing-spot-bite-times/fishing-spot-bite-times.component';
import { FishingSpotHooksetDatagridComponent } from './fishing-spot-hookset-datagrid/fishing-spot-hookset-datagrid.component';
import { FishingSpotTugDatagridComponent } from './fishing-spot-tug-datagrid/fishing-spot-tug-datagrid.component';
import { FishingSpotWeatherDatagridComponent } from './fishing-spot-weather-datagrid/fishing-spot-weather-datagrid.component';
import { FishingSpotBaitDatagridComponent } from './fishing-spot-bait-datagrid/fishing-spot-bait-datagrid.component';
import { FishingSpotHoursComponent } from './fishing-spot-hours/fishing-spot-hours.component';
import { FishingSpotAvailableFishesComponent } from './fishing-spot-available-fishes/fishing-spot-available-fishes.component';
import { FishingSpotWeatherTransitionsComponent } from './fishing-spot-weather-transitions/fishing-spot-weather-transitions.component';
import { FishingSpotWeathersComponent } from './fishing-spot-weathers/fishing-spot-weathers.component';
import { FishingSpotPositionComponent } from './fishing-spot-position/fishing-spot-position.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { DbCommentsComponent } from '../db-comments/db-comments/db-comments.component';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { I18nDisplayComponent } from '../../../modules/i18n-display/i18n-display/i18n-display.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-fishing-spot',
    templateUrl: './fishing-spot.component.html',
    styleUrls: ['./fishing-spot.component.less', '../fish/fish.common.less', '../common-db.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, FlexModule, I18nDisplayComponent, NzButtonModule, NzWaveModule, DbCommentsComponent, NzDividerModule, FishingSpotPositionComponent, FishingSpotWeathersComponent, FishingSpotWeatherTransitionsComponent, FishingSpotAvailableFishesComponent, FishingSpotHoursComponent, FishingSpotBaitDatagridComponent, FishingSpotWeatherDatagridComponent, FishingSpotTugDatagridComponent, FishingSpotHooksetDatagridComponent, FishingSpotBiteTimesComponent, PageLoaderComponent, AsyncPipe, I18nPipe, TranslateModule, IfMobilePipe, MapNamePipe]
})
export class FishingSpotComponent extends TeamcraftPageComponent implements OnInit, OnDestroy {
  public highlightedFish$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);

  private readonly loadingSub$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this.loadingSub$.pipe(distinctUntilChanged());

  public readonly fishingSpot$ = this.fishContext.spotId$.pipe(
    filter((spotId) => spotId >= 0),
    switchMap((id) => {
      this.loadingSub$.next(true);
      return this.lazyData.getRow('fishingSpotsDatabasePages', id);
    }),
    tap(() => this.loadingSub$.next(false)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly i18n: I18nToolsService,
    public readonly translate: TranslateService,
    private readonly router: Router,
    private readonly lazyData: LazyDataFacade,
    public readonly settings: SettingsService,
    private readonly dialog: NzModalService,
    private readonly fishContext: FishContextService,
    readonly seo: SeoService
  ) {
    super(seo);
  }

  ngOnInit() {
    super.ngOnInit();

    const slug$ = this.route.paramMap.pipe(map((params) => params.get('slug') ?? undefined));
    const spotId$ = this.route.paramMap.pipe(map((params) => +params.get('spotId') || undefined));
    const correctSlug$ = combineLatest([spotId$, this.lazyData.getEntry('fishingSpots')]).pipe(
      map(([spotId, spots]) => spots.find((spot) => spot.id === spotId)?.zoneId),
      switchMap((placeId) => (!placeId ? of(undefined) : this.i18n.getNameObservable('places', placeId))),
      map((name) => name?.split(' ').join('-'))
    );

    combineLatest([slug$, spotId$, correctSlug$])
      .pipe(
        takeUntil(this.onDestroy$),
        map(([slug, spotId, correctSlug]) => ({ slug, spotId, correctSlug }))
      )
      .subscribe(this.onRouteParams);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.fishContext.setSpotId(undefined);
    this.fishContext.setBaitId(undefined);
  }

  public showMissesPopup(spotId: number): void {
    this.dialog.create({
      nzTitle: `${this.translate.instant('DB.FISH.Misses_popup_title')}`,
      nzContent: FishingMissesPopupComponent,
      nzComponentParams: {
        spotId: spotId
      },
      nzFooter: null,
      nzWidth: '80vw'
    });
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.fishingSpot$.pipe(
      map((fishingSpot) => {
        return {
          title: this.i18n.getName(fishingSpot),
          description: '',
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/fishing-spot/${fishingSpot.id}/${this.i18n.getName(fishingSpot).split(' ').join('-')}`,
          image: `https://cdn.ffxivteamcraft.com/assets/icons/classjob/fisher.png`
        };
      })
    );
  }

  private readonly onRouteParams = ({ slug, spotId, correctSlug }: { slug?: string; spotId?: number; correctSlug?: string }) => {
    this.fishContext.setSpotId(spotId ?? undefined);
    if (!correctSlug) return;
    if (slug === undefined) {
      this.router.navigate([correctSlug], {
        relativeTo: this.route,
        replaceUrl: true
      });
    } else if (slug !== correctSlug) {
      this.router.navigate(['../', correctSlug], {
        relativeTo: this.route,
        replaceUrl: true
      });
    }
  };
}
