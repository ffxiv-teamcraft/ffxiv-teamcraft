import { TestBed } from '@angular/core/testing';
import { AlarmStatusService } from './alarm-status.service';
import { WeatherService } from '../eorzea/weather.service';
import {
  BLACK_JET_ALARM,
  CAPTAINS_CHALICE_ALARM,
  CATKILLER_ALARM,
  CRYSTAL_PIGEON_ALARM,
  DARKSTEEL_ORE_ALARM,
  EALAD_SKAAN_ALARM,
  FURCACAUDA_ALARM,
  MUD_PILGRIM_ALARM,
  THE_HORNED_KING_ALARM
} from './alarm-mocks';
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
    expect(differenceInMinutes(simpleSpawnedDarksteel.nextSpawn.despawn, nowSpawned)).toBe(155);
  });

  it('Should get alarm status properly for weather-only alarms', () => {
    const now = new Date('Wed Oct 04 3082 00:47:24 GMT+0200');
    const simpleCatkiller = service.getAlarmStatus(CATKILLER_ALARM, now);
    expect(simpleCatkiller.spawned).toBeTruthy();
    expect(differenceInMinutes(simpleCatkiller.nextSpawn.despawn, now)).toBeGreaterThan(0);

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

  it('Should handle annoying fishing cases', () => {
    const ealadSpawned = new Date('Oct 23 3082 23:40:00 GMT');
    const simpleEaladSkaan = service.getAlarmStatus(EALAD_SKAAN_ALARM, ealadSpawned);
    expect(simpleEaladSkaan.spawned).toBeTruthy();
    expect(differenceInMinutes(simpleEaladSkaan.previousSpawn.despawn, ealadSpawned)).toBeGreaterThan(0);

    const ealadNotSpawned = new Date('Wed Oct 04 3082 22:12:56 GMT');
    const simpleEaladSkaanNotSpawned = service.getAlarmStatus(EALAD_SKAAN_ALARM, ealadNotSpawned);
    expect(simpleEaladSkaanNotSpawned.spawned).toBeFalsy();
    expect(differenceInMinutes(simpleEaladSkaanNotSpawned.previousSpawn.despawn, ealadNotSpawned)).toBeLessThan(0);


    const furcacauda = new Date('Oct 05 3082 23:40:00 GMT');
    const simpleFurcacauda = service.getAlarmStatus(FURCACAUDA_ALARM, furcacauda);
    expect(simpleFurcacauda.nextSpawn.date.getUTCHours()).toBe(16);
    expect(simpleFurcacauda.nextSpawn.despawn.getUTCHours()).toBe(16);
    expect(simpleFurcacauda.nextSpawn.despawn.getUTCMinutes()).toBe(30);


    const captainsChalice = new Date('Oct 05 3082 23:40:00 GMT');
    const simpleCaptainsChalice = service.getAlarmStatus(CAPTAINS_CHALICE_ALARM, captainsChalice);
    expect(simpleCaptainsChalice.nextSpawn.date.getUTCHours()).toBe(23);
    expect(simpleCaptainsChalice.nextSpawn.despawn.getUTCHours()).toBe(1);
    expect(simpleCaptainsChalice.nextSpawn.despawn.getUTCMinutes()).toBe(4);
  });

  it('Should find current simple spawn right on time', () => {
    const simpleSpawn = service.getSimpleAlarmStatus(THE_HORNED_KING_ALARM, new Date('3082-10-29T00:00:00.000Z'));
    expect(simpleSpawn.nextSpawn.date.getUTCDate()).toBe(29);
  });

  it('Should work fine for Horned King', () => {
    const hornedKing = new Date(35117301600000);
    expect(service.getAlarmStatus(THE_HORNED_KING_ALARM, hornedKing)).not.toBeNull();
  });
});
