import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { weatherIndex } from '../../../../core/data/sources/weather-index';
import { EorzeanTimeService } from '../../../../core/eorzea/eorzean-time.service';
import { WeatherService } from '../../../../core/eorzea/weather.service';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, takeUntil } from 'rxjs/operators';
import { FishingSpotUtilsService } from '../fishing-spot-utils.service';
import { LazyFishingSpotsDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-fishing-spots-database-page';
import { WeatherIconPipe } from '../../../../pipes/pipes/weather-icon.pipe';
import { XivapiIconPipe } from '../../../../pipes/pipes/xivapi-icon.pipe';
import { I18nRowPipe } from '../../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { NgFor, AsyncPipe, DecimalPipe, DatePipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
    selector: 'app-fishing-spot-weathers',
    templateUrl: './fishing-spot-weathers.component.html',
    styleUrls: ['./fishing-spot-weathers.component.less', '../../common-db.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [FishingSpotUtilsService],
    standalone: true,
    imports: [NzCardModule, FlexModule, NgFor, AsyncPipe, DecimalPipe, DatePipe, I18nPipe, TranslateModule, I18nRowPipe, XivapiIconPipe, WeatherIconPipe]
})
export class FishingSpotWeathersComponent implements OnInit, OnDestroy {
  public highlightColor?: string;

  private readonly spot$ = new BehaviorSubject<LazyFishingSpotsDatabasePage | undefined>(undefined);

  private readonly time$ = this.etime.getEorzeanTime().pipe(distinctUntilChanged((a, b) => a.getUTCHours() % 8 === b.getUTCHours() % 8));

  public readonly weathers$ = combineLatest([this.spot$, this.time$]).pipe(
    map(([spot, time]) => {
      const rates = weatherIndex?.[spot?.weatherRate];
      return rates
        ?.map((row) => {
          return {
            chances: 100 * this.utils.getWeatherChances(spot.mapId, row.weatherId),
            next: this.etime.toEarthDate(this.weatherService.getNextWeatherStart(spot.mapId, row.weatherId, time.getTime(), false)),
            weatherId: row.weatherId,
            active: this.weatherService.getWeather(spot.mapId, time.getTime()) === row.weatherId
          };
        })
        .sort((a, b) => (a.active ? -1 : b.active ? 1 : a.next - b.next));
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private readonly highlightColor$ = this.utils.getHighlightColor(0.5).pipe(distinctUntilChanged());

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    public readonly utils: FishingSpotUtilsService,
    public readonly translate: TranslateService,
    private readonly etime: EorzeanTimeService,
    private readonly weatherService: WeatherService,
    private readonly cd: ChangeDetectorRef
  ) {
  }

  @Input()
  public set spot(value: LazyFishingSpotsDatabasePage | undefined) {
    this.spot$.next(value);
  }

  ngOnInit() {
    this.highlightColor$.pipe(takeUntil(this.unsubscribe$)).subscribe((color) => {
      this.highlightColor = color;
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
