import { Injectable } from '@angular/core';
import { mapIds } from '../data/sources/map-ids';
import { weatherIndex } from '../data/sources/weather-index';
import { EorzeanTimeService } from './eorzean-time.service';

@Injectable()
export class WeatherService {


  /**
   * Gets weather rate for a given time,
   * see https://github.com/viion/ffxiv-datamining/blob/master/docs/Weather.md for implementation details
   * @param timestamp
   */
  private getWeatherRateValue(timestamp: number): number {
    const unixSeconds = Math.round(timestamp / EorzeanTimeService.EPOCH_TIME_FACTOR / 1000);
    const eorzeanHour = unixSeconds / 175;
    // Do the magic 'cause for calculations 16:00 is 0, 00:00 is 8 and 08:00 is 16
    const increment = (eorzeanHour + 8 - (eorzeanHour % 8)) % 24;
    // Take Eorzea days since unix epoch
    let totalDays = unixSeconds / 4200;
    totalDays = (totalDays << 0) >>> 0; // Convert to uint
    // 0x64 = 100
    const calcBase = totalDays * 100 + increment;
    // 0xB = 11
    const step1 = ((calcBase << 11) ^ calcBase) >>> 0;
    const step2 = ((step1 >>> 8) ^ step1) >>> 0;
    // 0x64 = 100
    return step2 % 100;
  }

  public getWeather(mapId: number, timestamp: number, weatherRate?: any): number {
    weatherRate = weatherRate || weatherIndex[mapIds.find(map => map.id === mapId).weatherRate];
    const weatherRateValue = this.getWeatherRateValue(timestamp);
    const match = (weatherRate || []).find(rate => weatherRateValue < rate.rate);
    if (match !== undefined) {
      return match.weatherId;
    }
    return 1;
  }

  public getNextWeatherStart(mapId: number, weatherId: number, timestamp: number, weatherRate?: any): Date | null {
    weatherRate = weatherRate || weatherIndex[mapIds.find(map => map.id === mapId).weatherRate];
    if (this.getWeather(mapId, timestamp, weatherRate) === weatherId) {
      const resultDate = new Date(timestamp);
      resultDate.setUTCHours(Math.floor(resultDate.getUTCHours() / 8) * 8);
      resultDate.setUTCMinutes(0);
      return resultDate;
    }
    return this.getNextWeatherStart(mapId, weatherId, this.nextWeatherTime(timestamp), weatherRate);
  }

  public getNextWeatherTransition(mapId: number, fromWeatherIds: number[], weatherId: number, timestamp: number, weatherRate?: any, iteration = 0): Date | null {
    weatherRate = weatherRate || weatherIndex[mapIds.find(map => map.id === mapId).weatherRate];
    // 8 hours before
    const dateForPreviousWeather = timestamp - 8 * 60 * 60 * 1000 - 1;
    const previousWeather = this.getWeather(mapId, dateForPreviousWeather, weatherRate);
    if (fromWeatherIds.indexOf(previousWeather) > -1 && this.getWeather(mapId, timestamp, weatherRate) === weatherId) {
      const resultDate = new Date(timestamp);
      resultDate.setUTCHours(Math.floor(resultDate.getUTCHours() / 8) * 8);
      resultDate.setUTCMinutes(0);
      return resultDate;
    }
    return this.getNextWeatherTransition(mapId, fromWeatherIds, weatherId, this.nextWeatherTime(timestamp), weatherRate, iteration + 1);
  }

  public nextWeatherTime(timestamp: number): number {
    const date = new Date(timestamp);
    const hoursPast = date.getUTCHours() % 8;
    const difference = (((8 - hoursPast) * 60 - date.getUTCMinutes()) * 60 - date.getUTCSeconds()) * 1000 - date.getUTCMilliseconds();
    return date.getTime() + difference;
  }
}
