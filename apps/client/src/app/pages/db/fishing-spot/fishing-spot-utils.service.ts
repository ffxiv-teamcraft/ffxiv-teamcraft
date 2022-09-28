import { Injectable } from '@angular/core';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { mapIds } from '../../../core/data/sources/map-ids';
import { weatherIndex } from '../../../core/data/sources/weather-index';
import { SettingsService } from '../../../modules/settings/settings.service';
import { Theme } from '../../../modules/settings/theme';

@Injectable()
export class FishingSpotUtilsService {
  private highlightColor$ = this.settings.themeChange$.pipe(
    map(({ next }) => {
      return this.themeToColor(next);
    }),
    startWith(this.themeToColor(this.settings.theme)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private readonly settings: SettingsService) {
  }

  public getHighlightColor(weight: number = 1) {
    return this.highlightColor$.pipe(
      map((colors) => {
        return `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, ${Math.floor(weight * 90) / 100})`;
      })
    );
  }

  public getWeatherChances(mapId: number, weatherId: number): number {
    const index = weatherIndex[mapIds.find((m) => m.id === mapId).weatherRate];
    const maxRate = index[index.length - 1].rate;
    const matchingIndex = index.findIndex((row) => row.weatherId === weatherId);
    if (matchingIndex === 0) {
      return index[matchingIndex].rate / maxRate;
    }
    return (index[matchingIndex].rate - index[matchingIndex - 1].rate) / maxRate;
  }

  private themeToColor(theme: Theme): [number, number, number] {
    return theme.highlight
      .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
      .substring(1)
      .match(/.{2}/g)
      .map((x) => parseInt(x, 16)) as [number, number, number];
  }
}
