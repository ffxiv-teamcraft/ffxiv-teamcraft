import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { weatherIndex } from '../../../../core/data/sources/weather-index';
import { EorzeanTimeService } from '../../../../core/eorzea/eorzean-time.service';
import { WeatherService } from '../../../../core/eorzea/weather.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { FishingSpotUtilsService } from '../fishing-spot-utils.service';
import { LazyFishingSpotsDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-fishing-spots-database-page';

@Component({
  selector: 'app-fishing-spot-weather-transitions',
  templateUrl: './fishing-spot-weather-transitions.component.html',
  styleUrls: ['./fishing-spot-weather-transitions.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FishingSpotUtilsService]
})
export class FishingSpotWeatherTransitionsComponent {
  public readonly highlightColor$ = this.utils.getHighlightColor(0.5).pipe(distinctUntilChanged());

  private readonly spot$ = new BehaviorSubject<LazyFishingSpotsDatabasePage | undefined>(undefined);

  private readonly time$ = this.etime.getEorzeanTime().pipe(distinctUntilChanged((a, b) => a.getUTCHours() % 8 === b.getUTCHours() % 8));

  public readonly weatherTransitions$ = combineLatest([this.spot$, this.time$]).pipe(
    map(([spot, time]) => {
      const rates: any[] = weatherIndex[spot.weatherRate];
      return rates
        ?.flatMap((to) => {
          return rates?.map((from) => {
            const nextSpawn = this.weatherService.getNextWeatherTransition(spot.mapId, [from.weatherId], to.weatherId, time.getTime());
            return {
              chances:
                100 *
                this.utils.getWeatherChances(spot.mapId, to.weatherId) *
                this.utils.getWeatherChances(spot.mapId, from.weatherId),
              next: this.etime.toEarthDate(nextSpawn),
              nextET: nextSpawn.getUTCHours(),
              weatherId: to.weatherId,
              previousWeatherId: from.weatherId,
              active:
                this.weatherService.getWeather(spot.mapId, time.getTime()) === to.weatherId &&
                this.weatherService.getWeather(spot.mapId, time.getTime() - 8 * 60 * 60 * 1000 - 1) === from.weatherId
            };
          });
        })
        .sort((a, b) => (a.active ? -1 : b.active ? 1 : a.next.getTime() - b.next.getTime()));
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    public readonly utils: FishingSpotUtilsService,
    public readonly translate: TranslateService,
    private readonly etime: EorzeanTimeService,
    private readonly weatherService: WeatherService
  ) {
  }

  @Input()
  public set spot(value: LazyFishingSpotsDatabasePage | undefined) {
    this.spot$.next(value);
  }
}
