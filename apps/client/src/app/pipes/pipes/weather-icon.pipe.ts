import { Pipe, PipeTransform } from '@angular/core';
import { weatherIcons } from '../../core/data/sources/weather-icons';

@Pipe({
  name: 'weatherIcon'
})
export class WeatherIconPipe implements PipeTransform {
  transform(id: number): string | undefined {
    if (isNaN(+id)) return undefined;
    const icon = this.getWeatherIcon(id);
    if (icon) {
      return `./assets/icons/weather/0${icon.toString()}.png`;
    } else {
      return 'https://xivapi.com/img-misc/code-regular.svg';
    }
  }

  private getWeatherIcon(id: number): number {
    return weatherIcons[id];
  }
}
