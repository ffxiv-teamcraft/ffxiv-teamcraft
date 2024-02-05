import { AlarmDetails } from '@ffxiv-teamcraft/types';
import { PersistedAlarm } from './persisted-alarm';
import { AlarmStatus } from './alarm-status';
import { DateInterval, TimeUtils } from './time.utils';
import { WeatherService } from '../eorzea/weather.service';
import { inject, Injectable } from '@angular/core';
import { addDays, addMinutes, subDays, subMinutes } from 'date-fns';

@Injectable({ providedIn: 'root' })
export class AlarmStatusService {

  private weatherService = inject(WeatherService);

  public getAlarmStatus(alarm: AlarmDetails | PersistedAlarm, etime: Date): AlarmStatus {
    if (!alarm.spawns) {
      alarm.spawns = [];
    }
    if (alarm.weathers?.length > 0) {
      // If we have weather conditions, let's move to more complex stuff
      let previousTime = etime;
      let previousSpawn = etime;
      let previousDespawn: Date;
      let previousWeather: number;
      while (previousSpawn.getTime() >= etime.getTime()) {
        previousTime = new Date(this.weatherService.previousWeatherTime(previousTime.getTime()));
        const spawn = this.findWeatherSpawnCombination(alarm, previousTime.getTime(), true);
        previousSpawn = spawn.spawn;
        previousDespawn = spawn.despawn;
        previousWeather = spawn.weather;
      }

      const { spawn, despawn, weather } = this.findWeatherSpawnCombination(alarm, etime.getTime());
      const { spawn: nextSpawn, despawn: nextDespawn, weather: nextWeather } = this.findWeatherSpawnCombination(alarm, despawn.getTime());

      return {
        spawned: despawn.getTime() > etime.getTime() && spawn.getTime() < etime.getTime(),
        previousSpawn: {
          date: previousSpawn,
          despawn: previousDespawn,
          weather: previousWeather
        },
        nextSpawn: {
          date: spawn,
          despawn: despawn,
          weather: weather
        },
        secondNextSpawn: {
          date: nextSpawn,
          despawn: nextDespawn,
          weather: nextWeather
        }
      };
    }
    // If we don't have weather stuff at all and just need time condition
    return this.getSimpleAlarmStatus(alarm, etime);
  }

  public getSimpleAlarmStatus(alarm: AlarmDetails | PersistedAlarm, etime: Date): AlarmStatus | null {
    if (alarm.spawns.length === 0) {
      return null;
    }
    let previousSpawn = alarm.spawns.map(spawn => {
      // Getting minutes from spawn hour's decimal part
      const spawnMinutes = Math.floor(spawn % 1 * 60);
      const spawnHours = Math.floor(spawn);
      return this.findPreviousTime(etime, spawnHours, spawnMinutes);
    }).sort((a, b) => {
      return (etime.getTime() - a.getTime()) - (etime.getTime() - b.getTime());
    })[0];
    let nextSpawn = this.getNextSpawnFromTime(alarm, etime);
    if (addMinutes(previousSpawn, alarm.duration * 60).getTime() > etime.getTime()) {
      nextSpawn = previousSpawn;
      previousSpawn = alarm.spawns.map(spawn => {
        // Getting minutes from spawn hour's decimal part
        const spawnMinutes = Math.floor(spawn % 1 * 60);
        const spawnHours = Math.floor(spawn);
        return this.findPreviousTime(subMinutes(previousSpawn, 5), spawnHours, spawnMinutes);
      }).sort((a, b) => {
        return (etime.getTime() - a.getTime()) - (etime.getTime() - b.getTime());
      })[0];
    }
    const nextDespawn = addMinutes(nextSpawn, alarm.duration * 60);
    const secondNextSpawn = this.getNextSpawnFromTime(alarm, addMinutes(nextSpawn, alarm.duration * 60));
    return {
      spawned: nextDespawn.getTime() > etime.getTime() && nextSpawn.getTime() < etime.getTime(),
      previousSpawn: {
        date: previousSpawn,
        despawn: addMinutes(previousSpawn, alarm.duration * 60)
      },
      nextSpawn: {
        date: nextSpawn,
        despawn: nextDespawn
      },
      secondNextSpawn: {
        date: secondNextSpawn,
        despawn: addMinutes(secondNextSpawn, alarm.duration * 60)
      }
    };
  }

  private getNextSpawnFromTime(alarm: AlarmDetails | PersistedAlarm, etime: Date): Date {
    return alarm.spawns.map(spawn => {
      // Getting minutes from spawn hour's decimal part
      const spawnMinutes = Math.floor(spawn % 1 * 60);
      const spawnHours = Math.floor(spawn);
      return this.findNextTime(etime, spawnHours, spawnMinutes);
    }).sort((a, b) => {
      return (a.getTime() - etime.getTime()) - (b.getTime() - etime.getTime());
    })[0];
  }

  public findPreviousTime(etime: Date, hour: number, minutes = 0): Date {
    const occurence = new Date(etime);
    occurence.setUTCHours(hour, minutes, 0, 0);
    if (occurence.getTime() <= etime.getTime()) {
      return occurence;
    }
    return subDays(occurence, 1);
  }

  public findNextTime(etime: Date, hour: number, minutes = 0): Date {
    const nextOccurence = new Date(etime);
    nextOccurence.setUTCHours(hour, minutes, 0, 0);
    if (nextOccurence.getTime() >= etime.getTime()) {
      return nextOccurence;
    }
    return addDays(nextOccurence, 1);
  }

  private findWeatherSpawnCombination(alarm: AlarmDetails, etime: number, previous = false, iteration = etime): {
    spawn: Date,
    despawn: Date,
    weather: number
  } {
    const weatherSpawns = alarm.weathers
      .map(weather => {
        if (alarm.weathersFrom !== undefined && alarm.weathersFrom.length > 0) {
          return {
            weather: weather,
            spawn: this.weatherService.getNextWeatherTransition(alarm.mapId, alarm.weathersFrom, weather, iteration,
              alarm.spawns || [], alarm.duration)
          };
        }
        return { weather: weather, spawn: this.weatherService.getNextWeatherStart(alarm.mapId, weather, iteration, false, alarm.spawns || [], alarm.duration) };
      })
      .filter(spawn => spawn?.spawn !== null)
      .sort((a, b) => a.spawn.getTime() - b.spawn.getTime());
    for (const weatherSpawn of weatherSpawns) {
      const normalWeatherStop = new Date(this.weatherService.getNextDiffWeatherTime(weatherSpawn.spawn.getTime(), alarm.weathers, alarm.mapId));
      const transitionWeatherStop = new Date(this.weatherService.nextWeatherTime(weatherSpawn.spawn.getTime()));
      const weatherStop = alarm.weathersFrom?.length > 0 ? transitionWeatherStop : normalWeatherStop;
      if (alarm.spawns?.length === 0) {
        const weatherSpawn = weatherSpawns[0];
        return {
          spawn: weatherSpawn.spawn,
          despawn: weatherStop,
          weather: weatherSpawn.weather
        };
      }
      const status = this.getSimpleAlarmStatus(alarm, weatherSpawn.spawn);
      const spawnBasedRange: DateInterval = [status.nextSpawn.date, status.nextSpawn.despawn];
      const range = TimeUtils.getDateIntersection(spawnBasedRange, [weatherSpawn.spawn, weatherStop]);
      if (range) {
        return {
          spawn: range[0],
          despawn: range[1],
          weather: weatherSpawn.weather
        };
      }
    }

    try {
      return this.findWeatherSpawnCombination(alarm, etime, previous, previous ? this.weatherService.previousWeatherTime(iteration) : this.weatherService.nextWeatherTime(weatherSpawns[0].spawn.getTime()));
    } catch (e) {
      console.error(e);
      return null;
    }
  }

}
