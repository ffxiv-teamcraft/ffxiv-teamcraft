import { AlarmDetails } from '@ffxiv-teamcraft/types';
import { PersistedAlarm } from './persisted-alarm';
import { AlarmStatus } from './alarm-status';
import { TimeUtils } from './time.utils';
import { WeatherService } from '../eorzea/weather.service';
import { inject, Injectable } from '@angular/core';
import { EorzeanTimeService } from '../eorzea/eorzean-time.service';

@Injectable({ providedIn: 'root' })
export class AlarmStatusService {

  private weatherService = inject(WeatherService);

  public getAlarmStatus(alarm: AlarmDetails | PersistedAlarm, edate: Date): AlarmStatus {
    return null;
  }

  public findNextTime(etime: Date, hour: number, minutes = 0): Date {
    const adjustedHour = hour || 24;
    const adjustedMinutes = minutes || 60;
    const nextOccurence = new Date(etime);
    nextOccurence.setUTCHours(hour, minutes);
    if (etime.getUTCHours() < adjustedHour && etime.getUTCMinutes() < adjustedMinutes) {
      const result = new Date(etime);
      result.setUTCHours(hour, minutes);
      return result;
    }
  }

  private findWeatherSpawnCombination(alarm: AlarmDetails, sortedSpawns: number[], time: number, iteration = time) {
    const weatherSpawns = alarm.weathers
      .map(weather => {
        if (alarm.weathersFrom !== undefined && alarm.weathersFrom.length > 0) {
          return {
            weather: weather,
            spawn: this.weatherService.getNextWeatherTransition(alarm.mapId, alarm.weathersFrom, weather, iteration,
              alarm.spawns, alarm.duration)
          };
        }
        return { weather: weather, spawn: this.weatherService.getNextWeatherStart(alarm.mapId, weather, iteration, false, alarm.spawns, alarm.duration) };
      })
      .filter(spawn => spawn.spawn !== null)
      .sort((a, b) => a.spawn.getTime() - b.spawn.getTime());
    for (const weatherSpawn of weatherSpawns) {
      for (const spawn of sortedSpawns) {
        const despawn = (spawn + alarm.duration) % 24;
        const weatherStart = weatherSpawn.spawn.getUTCHours();
        const normalWeatherStop = new Date(this.weatherService.getNextDiffWeatherTime(weatherSpawn.spawn.getTime(), alarm.weathers, alarm.mapId)).getUTCHours() || 24;
        const transitionWeatherStop = new Date(this.weatherService.nextWeatherTime(weatherSpawn.spawn.getTime())).getUTCHours() || 24;
        const weatherStop = alarm.weathersFrom?.length > 0 ? transitionWeatherStop : normalWeatherStop;
        const range = TimeUtils.getIntersection([spawn, despawn], [weatherStart, weatherStop % 24]);
        if (range) {
          const intersectSpawn = range[0];
          const intersectDespawn = range[1] || 24;
          // Set the snapshot date to the moment at which the node will spawn for real.
          const date = weatherSpawn.spawn;
          date.setUTCHours(intersectSpawn);
          date.setUTCMinutes(0);
          date.setUTCSeconds(0);
          date.setUTCMilliseconds(0);
          // Adding 3 seconds margin for days computation
          const days = Math.max(Math.floor((weatherSpawn.spawn.getTime() - time + 3000 * EorzeanTimeService.EPOCH_TIME_FACTOR) / 86400000), 0);
          // If it's for today, make sure it's not already despawned
          const now = new Date(time);
          const didntSpawnYet = !TimeUtils.isSameDay(now, weatherSpawn.spawn) || now.getUTCHours() < intersectDespawn;
          const isSpawned = TimeUtils.isSameDay(now, weatherSpawn.spawn) && now.getUTCHours() >= weatherStart;
          if (days > 0 || didntSpawnYet || isSpawned) {
            return {
              hours: intersectSpawn,
              days: days,
              despawn: intersectDespawn,
              weather: weatherSpawn.weather,
              date
            };
          }
        }
      }
    }
    if (sortedSpawns?.length === 0) {
      const weatherSpawn = weatherSpawns[0];
      const days = Math.max(Math.floor((weatherSpawn.spawn.getTime() - time) / 86400000), 0);
      const normalWeatherStop = new Date(this.weatherService.getNextDiffWeatherTime(weatherSpawn.spawn.getTime(), alarm.weathers, alarm.mapId)).getUTCHours() || 24;
      const transitionWeatherStop = new Date(this.weatherService.nextWeatherTime(weatherSpawn.spawn.getTime())).getUTCHours() || 24;
      return {
        hours: weatherSpawn.spawn.getUTCHours(),
        days: days,
        date: weatherSpawn.spawn,
        despawn: alarm.weathersFrom?.length > 0 ? transitionWeatherStop : normalWeatherStop,
        weather: weatherSpawn.weather
      };
    }

    try {
      return this.findWeatherSpawnCombination(alarm, sortedSpawns, time, this.weatherService.nextWeatherTime(weatherSpawns[0].spawn.getTime()));
    } catch (e) {
      console.error(e);
      return null;
    }
  }

}
