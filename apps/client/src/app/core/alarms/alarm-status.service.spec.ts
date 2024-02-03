import { TestBed } from '@angular/core/testing';
import { AlarmStatusService } from './alarm-status.service';
import { WeatherService } from '../eorzea/weather.service';
import { BLACK_JET_ALARM, CATKILLER_ALARM, CRYSTAL_PIGEON_ALARM, DARKSTEEL_ORE_ALARM, MUD_PILGRIM_ALARM } from './alarm-mocks';
import { differenceInHours, differenceInMinutes } from 'date-fns';

describe('AlarmStatusService', () => {

  let service: AlarmStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlarmStatusService, WeatherService]
    });

    service = TestBed.inject(AlarmStatusService);
  });

  it('Can find next spawn for basic use cases', () => {
    [
      {
        date: new Date('05-08-3078 15:35 GMT'),
        targetHour: 17,
        targetMinutes: 0,
        sameDay: true
      },
      {
        date: new Date('05-08-3078 15:35 GMT'),
        targetHour: 3,
        targetMinutes: 0,
        sameDay: false
      },
      {
        date: new Date('05-08-3078 15:35 GMT'),
        targetHour: 0,
        targetMinutes: 0,
        sameDay: false
      },
      {
        date: new Date('05-08-3078 15:35 GMT'),
        targetHour: 16,
        targetMinutes: 28,
        sameDay: true
      },
      {
        date: new Date('Tue Oct 03 3082 00:58:54 GMT+0200'),
        targetHour: 1,
        targetMinutes: 0,
        sameDay: false
      }
    ].forEach(({ date, targetMinutes, targetHour, sameDay }) => {
      const res = service.findNextTime(date, targetHour, targetMinutes);
      expect(res.getUTCHours()).toBe(targetHour);
      expect(res.getUTCMinutes()).toBe(targetMinutes);
      if (sameDay) {
        expect(res.getUTCDate()).toBe(date.getUTCDate());
      } else {
        expect(res.getUTCDate()).not.toBe(date.getUTCDate());
      }
    });
  });

  it('Can find previous spawn for basic use cases', () => {
    [
      {
        date: new Date('05-08-3078 15:35 GMT'),
        targetHour: 17,
        targetMinutes: 0,
        sameDay: false
      },
      {
        date: new Date('05-08-3078 15:35 GMT'),
        targetHour: 3,
        targetMinutes: 0,
        sameDay: true
      },
      {
        date: new Date('05-08-3078 15:35 GMT'),
        targetHour: 0,
        targetMinutes: 0,
        sameDay: true
      },
      {
        date: new Date('05-08-3078 15:35 GMT'),
        targetHour: 16,
        targetMinutes: 28,
        sameDay: false
      },
      {
        date: new Date('Tue Oct 03 3082 03:58:54 GMT+0200'),
        targetHour: 1,
        targetMinutes: 0,
        sameDay: true
      }
    ].forEach(({ date, targetMinutes, targetHour, sameDay }) => {
      const res = service.findPreviousTime(date, targetHour, targetMinutes);
      expect(res.getUTCHours()).toBe(targetHour);
      expect(res.getUTCMinutes()).toBe(targetMinutes);
      if (sameDay) {
        expect(res.getUTCDate()).toBe(date.getUTCDate());
      } else {
        expect(res.getUTCDate()).not.toBe(date.getUTCDate());
      }
    });
  });

  it('Should get alarm status properly for simple time-only cases', () => {
    const now = new Date('Tue Oct 03 3082 00:58:54 GMT+0200');
    const simpleDarksteel = service.getAlarmStatus(DARKSTEEL_ORE_ALARM, now);
    expect(simpleDarksteel.spawned).toBeFalsy();
    expect(differenceInMinutes(simpleDarksteel.nextSpawn.date, now)).toBe(121);

    const nowSpawned = new Date('Tue Oct 03 3082 03:25:00 GMT+0200');
    const simpleSpawnedDarksteel = service.getAlarmStatus(DARKSTEEL_ORE_ALARM, nowSpawned);
    expect(simpleSpawnedDarksteel.spawned).toBeTruthy();
    expect(differenceInMinutes(simpleSpawnedDarksteel.previousSpawn.despawn, nowSpawned)).toBe(155);
  });

  it('Should get alarm status properly for weather-only alarms', () => {
    const now = new Date('Wed Oct 04 3082 00:47:24 GMT+0200');
    const simpleCatkiller = service.getAlarmStatus(CATKILLER_ALARM, now);
    expect(simpleCatkiller.spawned).toBeTruthy();
    expect(differenceInMinutes(simpleCatkiller.previousSpawn.despawn, now)).toBeGreaterThan(0);

    const notSpawned = new Date('Wed Oct 04 3082 05:00:00 GMT+0200');
    const simpleCatkillerNotSpawned = service.getAlarmStatus(CATKILLER_ALARM, notSpawned);
    expect(simpleCatkillerNotSpawned.spawned).toBeFalsy();
    expect(differenceInMinutes(simpleCatkillerNotSpawned.previousSpawn.despawn, notSpawned)).toBeLessThan(0);
    expect(differenceInMinutes(simpleCatkillerNotSpawned.nextSpawn.date, notSpawned)).toBeGreaterThan(0);
  });

  it('Should get alarm status properly for weather + time alarms', () => {
    const now = new Date('Wed Oct 04 3082 08:36:38 GMT+0200');
    const simpleMudPilgrim = service.getAlarmStatus(MUD_PILGRIM_ALARM, now);
    expect(simpleMudPilgrim.spawned).toBeTruthy();
    expect(differenceInMinutes(simpleMudPilgrim.previousSpawn.despawn, now)).toBeGreaterThan(0);

    const notSpawned = new Date('Wed Oct 04 3082 09:36:38 GMT+0200');
    const simpleMudPilgrimNotSpawned = service.getAlarmStatus(MUD_PILGRIM_ALARM, notSpawned);
    expect(simpleMudPilgrimNotSpawned.spawned).toBeFalsy();
    expect(differenceInMinutes(simpleMudPilgrimNotSpawned.previousSpawn.despawn, notSpawned)).toBeLessThan(0);
    expect(differenceInHours(simpleMudPilgrimNotSpawned.nextSpawn.date, notSpawned)).toBe(81); // 81 is 4 earth time hours
  });

  it('Should get alarm status properly for weather transition alarms', () => {
    const now = new Date('Wed Oct 04 3082 09:36:38 GMT+0200');
    const simpleCrystalPigeon = service.getAlarmStatus(CRYSTAL_PIGEON_ALARM, now);
    expect(simpleCrystalPigeon.spawned).toBeTruthy();
    expect(differenceInMinutes(simpleCrystalPigeon.previousSpawn.despawn, now)).toBeGreaterThan(0);

    const notSpawned = new Date('Wed Oct 04 3082 10:36:38 GMT+0200');
    const simpleCrystalPigeonNotSpawned = service.getAlarmStatus(CRYSTAL_PIGEON_ALARM, notSpawned);
    expect(simpleCrystalPigeonNotSpawned.spawned).toBeFalsy();
    expect(differenceInMinutes(simpleCrystalPigeonNotSpawned.previousSpawn.despawn, notSpawned)).toBeLessThan(0);
    expect(differenceInHours(simpleCrystalPigeonNotSpawned.nextSpawn.date, notSpawned)).toBe(15); // 15 is around 40min
  });

  it('Should get alarm status properly for weather transition alarms', () => {
    const now = new Date('Wed Oct 04 3082 11:12:56 GMT+0200');
    const simpleBlackJet = service.getAlarmStatus(BLACK_JET_ALARM, now);
    expect(simpleBlackJet.spawned).toBeTruthy();
    expect(differenceInMinutes(simpleBlackJet.previousSpawn.despawn, now)).toBeGreaterThan(0);

    const notSpawned = new Date('Wed Oct 04 3082 23:12:56 GMT+0200');
    const simpleBlackJetNotSpawned = service.getAlarmStatus(BLACK_JET_ALARM, notSpawned);
    expect(simpleBlackJetNotSpawned.spawned).toBeFalsy();
    expect(differenceInMinutes(simpleBlackJetNotSpawned.previousSpawn.despawn, notSpawned)).toBeLessThan(0);
    expect(differenceInHours(simpleBlackJetNotSpawned.nextSpawn.date, notSpawned)).toBe(76); // 76 is around 4 hours
  });
});
