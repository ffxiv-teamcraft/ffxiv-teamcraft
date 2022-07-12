import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { weatherIndex } from '../../../../core/data/sources/weather-index';
import { EorzeanTimeService } from '../../../../core/eorzea/eorzean-time.service';
import { WeatherService } from '../../../../core/eorzea/weather.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { FishingSpotUtilsService } from '../fishing-spot-utils.service';
import { XivApiFishingSpot } from '../fishing-spot.component';

@Component({
  selector: 'app-fishing-spot-weather-transitions',
  templateUrl: './fishing-spot-weather-transitions.component.html',
  styleUrls: ['./fishing-spot-weather-transitions.component.less', '../../common-db.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FishingSpotUtilsService]
})
export class FishingSpotWeatherTransitionsComponent {
  public readonly highlightColor$ = this.utils.getHighlightColor(0.5).pipe(distinctUntilChanged());

  private readonly spot$ = new BehaviorSubject<XivApiFishingSpot | undefined>(undefined);

  private readonly time$ = this.etime.getEorzeanTime().pipe(distinctUntilChanged((a, b) => a.getUTCHours() % 8 === b.getUTCHours() % 8));

  public readonly weatherTransitions$ = combineLatest([this.spot$, this.time$]).pipe(
    map(([spot, time]) => {
      const rates: any[] = weatherIndex[spot.TerritoryType.WeatherRate];
      return rates
        ?.flatMap((to) => {
          return rates?.map((from) => {
            const nextSpawn = this.weatherService.getNextWeatherTransition(spot.TerritoryType.MapTargetID, [from.weatherId], to.weatherId, time.getTime());
            return {
              chances:
                100 *
                this.utils.getWeatherChances(spot.TerritoryType.MapTargetID, to.weatherId) *
                this.utils.getWeatherChances(spot.TerritoryType.MapTargetID, from.weatherId),
              next: this.etime.toEarthDate(nextSpawn),
              nextET: nextSpawn.getUTCHours(),
              weatherId: to.weatherId,
              previousWeatherId: from.weatherId,
              active:
                this.weatherService.getWeather(spot.TerritoryType.MapTargetID, time.getTime()) === to.weatherId &&
                this.weatherService.getWeather(spot.TerritoryType.MapTargetID, time.getTime() - 8 * 60 * 60 * 1000 - 1) === from.weatherId
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
  public set spot(value: XivApiFishingSpot | undefined) {
    this.spot$.next(value);
  }
}
