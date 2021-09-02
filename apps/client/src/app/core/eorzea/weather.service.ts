import { Injectable } from '@angular/core';
import { mapIds } from '../data/sources/map-ids';
import { weatherIndex } from '../data/sources/weather-index';
import { EorzeanTimeService } from './eorzean-time.service';
import { add, sub } from 'date-fns';
import { TimeUtils } from '../alarms/time.utils';

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

  public getNextWeatherStart(mapId: number, weatherId: number, timestamp: number, spawns?: number[], duration?: number, weatherRate?: any, iterations = 0): Date | null {
    if (iterations >= 500) {
      return null;
    }
    weatherRate = weatherRate || weatherIndex[mapIds.find(map => map.id === mapId).weatherRate];
    if (this.getWeather(mapId, timestamp + 1000, weatherRate) === weatherId) {
      if (spawns?.length > 0) {
        const spawnHour = new Date(timestamp).getUTCHours();
        if (spawns.some(spawn => TimeUtils.isInInterval([spawn, (spawn + duration) % 24], spawnHour))) {
          const resultDate = new Date(timestamp);
          resultDate.setUTCHours(Math.floor(resultDate.getUTCHours() / 8) * 8);
          resultDate.setUTCMinutes(0);
          resultDate.setUTCSeconds(0);
          return resultDate;
        }
      } else {
        const resultDate = new Date(timestamp);
        resultDate.setUTCHours(Math.floor(resultDate.getUTCHours() / 8) * 8);
        resultDate.setUTCMinutes(0);
        resultDate.setUTCSeconds(0);
        return resultDate;
      }
    }
    return this.getNextWeatherStart(mapId, weatherId, this.nextWeatherTime(timestamp), spawns, duration, weatherRate, iterations + 1);
  }

  public getNextWeatherTransition(mapId: number, fromWeatherIds: number[], weatherId: number, timestamp: number, spawns?: number[], duration?: number, weatherRate?: any, iteration = 0): Date | null {
    weatherRate = weatherRate || weatherIndex[mapIds.find(map => map.id === mapId).weatherRate];
    const nextStart = this.getNextWeatherStart(mapId, weatherId, timestamp, spawns, duration, weatherRate);
    if (nextStart === null) {
      return null;
    }
    // 8 hours before
    const previousWeatherDate = sub(new Date(nextStart), { hours: 7, minutes: 59 });
    const previousWeather = this.getWeather(mapId, previousWeatherDate.getTime(), weatherRate);
    if (fromWeatherIds.includes(previousWeather)) {
      return nextStart;
    }
    return this.getNextWeatherTransition(mapId, fromWeatherIds, weatherId, this.nextWeatherTime(nextStart.getTime() + 5), spawns, duration, weatherRate, iteration + 1);
  }

  public nextWeatherTime(timestamp: number): number {
    const date = new Date(timestamp);
    const newDate = add(date, { hours: 8 });
    newDate.setUTCHours(Math.floor(newDate.getUTCHours() / 8) * 8);
    newDate.setUTCMinutes(0);
    newDate.setUTCSeconds(0);
    return newDate.getTime();
  }
}
