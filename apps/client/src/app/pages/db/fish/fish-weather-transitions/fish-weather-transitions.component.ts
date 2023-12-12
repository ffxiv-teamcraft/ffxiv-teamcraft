import { ChangeDetectionStrategy, Component } from '@angular/core';
import { weatherIndex } from '../../../../core/data/sources/weather-index';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FishContextService } from '../../service/fish-context.service';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { mapIds } from '../../../../core/data/sources/map-ids';
import { WeatherIconPipe } from '../../../../pipes/pipes/weather-icon.pipe';
import { XivapiIconPipe } from '../../../../pipes/pipes/xivapi-icon.pipe';
import { I18nRowPipe } from '../../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgFor, NgIf, AsyncPipe, DecimalPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
    selector: 'app-fish-weather-transitions',
    templateUrl: './fish-weather-transitions.component.html',
    styleUrls: ['./fish-weather-transitions.component.less', '../../common-db.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzCardModule, FlexModule, NgFor, NzButtonModule, NzIconModule, NgIf, AsyncPipe, DecimalPipe, I18nPipe, TranslateModule, I18nRowPipe, XivapiIconPipe, WeatherIconPipe]
})
export class FishWeatherTransitionsComponent {
  public readonly loading$ = this.fishCtx.weatherTransitionsByFish$.pipe(map((res) => res.loading));

  public readonly weatherTransitions$ = combineLatest([this.fishCtx.weatherTransitionsByFish$, this.fishCtx.spotId$, this.lazyData.getEntry('fishingSpots')]).pipe(
    map(([res, spotId, fishingSpots]) => {
      if (!res.data) return [];
      return Object.values(res.data.byId)
        .map((entry) => {
          let transitionChances: number | undefined;
          if (spotId !== undefined) {
            const spotData = fishingSpots.find((row) => row.id === spotId);
            const weatherChances = this.getWeatherChances(spotData.mapId, entry.toId);
            const previousWeatherChances = this.getWeatherChances(spotData.mapId, entry.fromId);
            transitionChances = 100 * weatherChances * previousWeatherChances;
          }
          return {
            ...entry,
            transitionChances,
            percent: 100 * (entry.occurrences / res.data.total)
          };
        })
        .sort((a, b) => b.percent - a.percent);
    }),
    startWith([])
  );

  constructor(private readonly lazyData: LazyDataFacade, public readonly settings: SettingsService, public readonly fishCtx: FishContextService) {
  }

  private getWeatherChances(mapId: number, weatherId: number): number {
    const index = weatherIndex[mapIds.find((m) => m.id === mapId).weatherRate];
    const maxRate = index[index.length - 1].rate;
    const matchingIndex = index.findIndex((row) => row.weatherId === weatherId);
    if (matchingIndex === -1) {
      return 0;
    }
    if (matchingIndex === 0) {
      return index[matchingIndex].rate / maxRate;
    }
    return (index[matchingIndex].rate - index[matchingIndex - 1].rate) / maxRate;
  }
}
