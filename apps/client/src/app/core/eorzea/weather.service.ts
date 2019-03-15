import { Injectable } from '@angular/core';
import { mapIds } from '../data/sources/map-ids';
import { weatherIndex } from '../data/sources/weather-index';
import { EorzeanTimeService } from './eorzean-time.service';

@Injectable()
export class WeatherService {


  /**
   * Gets weather rate for a given time,
   * see https://github.com/viion/ffxiv-datamining/blob/master/docs/Weather.md for implementation details
   * @param date
   */
  private getWeatherRateValue(date: Date): number {
    const unixSeconds = Math.round(date.getTime() / EorzeanTimeService.EPOCH_TIME_FACTOR / 1000);
    const eorzeanHour = unixSeconds / 175;
    // Do the magic 'cause for calculations 16:00 is 0, 00:00 is 8 and 08:00 is 16
    const increment = (eorzeanHour + 8 - (eorzeanHour % 8)) % 24;
    // Take Eorzea days since unix epoch
    let totalDays = unixSeconds / 4200;
    totalDays = (totalDays << 32) >>> 0; // Convert to uint
    // 0x64 = 100
    const calcBase = totalDays * 100 + increment;
    // 0xB = 11
    const step1 = ((calcBase << 11) ^ calcBase) >>> 0;
    const step2 = ((step1 >>> 8) ^ step1) >>> 0;
    // 0x64 = 100
    return step2 % 100;
  }

  public getWeather(mapId: number, date: Date): number {
    const weatherRate = weatherIndex[mapIds.find(map => map.id === mapId).weatherRate];
    const weatherRateValue = this.getWeatherRateValue(new Date(date));
    const rates = Object.keys(weatherRate);
    for (const rate of rates) {
      if (weatherRateValue <= +rate) {
        return weatherRate[rate];
      }
    }
    return 1;
  }

  public getNextWeatherStart(mapId: number, weatherId: number, date: Date, weatherRate?: any): Date | null {
    weatherRate = weatherRate || weatherIndex[mapIds.find(map => map.id === mapId).weatherRate];
    if (!Object.keys(weatherRate).some(key => weatherRate[key] === weatherId)) {
      return null;
    }
    if (this.getWeather(mapId, date) === weatherId) {
      const resultDate = new Date(date);
      resultDate.setUTCHours(Math.floor(resultDate.getUTCHours() / 8) * 8);
      resultDate.setUTCMinutes(0);
      return resultDate;
    }
    return this.getNextWeatherStart(mapId, weatherId, this.nextWeatherTime(date), weatherRate);
  }

  public nextWeatherTime(date: Date) {
    date = new Date(date);
    const hoursPast = date.getUTCHours() % 8;
    const difference = (((8 - hoursPast) * 60 - date.getUTCMinutes()) * 60 - date.getUTCSeconds()) * 1000 - date.getUTCMilliseconds();
    date.setTime(date.getTime() + difference);
    return date;
  }
}
