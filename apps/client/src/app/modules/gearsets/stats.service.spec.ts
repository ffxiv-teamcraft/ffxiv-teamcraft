import { inject, TestBed } from '@angular/core/testing';
import { StatsService } from './stats.service';
import { BaseParam } from '@ffxiv-teamcraft/data/game';

xdescribe('StatsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StatsService
      ]
    });
  });

  it('should be created', inject([StatsService], (service: StatsService) => {
    expect(service).toBeTruthy();
  }));

  it('should get base stats accurately', inject([StatsService], (service: StatsService) => {
    const statsEntries = [
      {
        job: 24,
        level: 73,
        tribe: 11,
        stats: [
          { id: BaseParam.MIND, value: 401 },
          { id: BaseParam.DIRECT_HIT_RATE, value: 367 },
          { id: BaseParam.CRITICAL_HIT, value: 367 },
          { id: BaseParam.DETERMINATION, value: 305 },
          { id: BaseParam.SPELL_SPEED, value: 367 },
          { id: BaseParam.PIETY, value: 305 },
          { id: BaseParam.VITALITY, value: 304 }
        ]
      },
      {
        job: 19,
        level: 79,
        tribe: 11,
        stats: [
          { id: BaseParam.STRENGTH, value: 334 },
          { id: BaseParam.DIRECT_HIT_RATE, value: 378 },
          { id: BaseParam.CRITICAL_HIT, value: 378 },
          { id: BaseParam.DETERMINATION, value: 335 },
          { id: BaseParam.SKILL_SPEED, value: 378 },
          { id: BaseParam.VITALITY, value: 415 },
          { id: BaseParam.TENACITY, value: 378 }
        ]
      },
      {
        job: 1,
        level: 79,
        tribe: 11,
        stats: [
          { id: BaseParam.STRENGTH, value: 317 },
          { id: BaseParam.DIRECT_HIT_RATE, value: 378 },
          { id: BaseParam.CRITICAL_HIT, value: 378 },
          { id: BaseParam.DETERMINATION, value: 335 },
          { id: BaseParam.SKILL_SPEED, value: 378 },
          { id: BaseParam.VITALITY, value: 382 },
          { id: BaseParam.TENACITY, value: 378 }
        ]
      },
      {
        job: 19,
        level: 80,
        tribe: 11,
        stats: [
          { id: BaseParam.STRENGTH, value: 339 },
          { id: BaseParam.VITALITY, value: 421 }
        ]
      },
      {
        job: 1,
        level: 80,
        tribe: 11,
        stats: [
          { id: BaseParam.STRENGTH, value: 322 },
          { id: BaseParam.VITALITY, value: 387 }
        ]
      },
      {
        job: 26,
        level: 80,
        tribe: 11,
        stats: [
          { id: BaseParam.INTELLIGENCE, value: 405 },
          { id: BaseParam.VITALITY, value: 322 }
        ]
      },
      {
        job: 28,
        level: 80,
        tribe: 11,
        stats: [
          { id: BaseParam.MIND, value: 442 },
          { id: BaseParam.VITALITY, value: 339 }
        ]
      },
      {
        job: 27,
        level: 80,
        tribe: 11,
        stats: [
          { id: BaseParam.INTELLIGENCE, value: 439 },
          { id: BaseParam.VITALITY, value: 339 }
        ]
      },
      {
        job: 7,
        level: 29,
        tribe: 11,
        stats: [
          { id: BaseParam.INTELLIGENCE, value: 104 },
          { id: BaseParam.DIRECT_HIT_RATE, value: 168 },
          { id: BaseParam.CRITICAL_HIT, value: 168 },
          { id: BaseParam.DETERMINATION, value: 92 },
          { id: BaseParam.SPELL_SPEED, value: 168 },
          { id: BaseParam.VITALITY, value: 86 }
        ]
      },
      {
        job: 6,
        level: 80,
        tribe: 11,
        stats: [
          { id: BaseParam.MIND, value: 408 },
          { id: BaseParam.VITALITY, value: 322 }
        ]
      },
      {
        job: 24,
        level: 80,
        tribe: 11,
        stats: [
          { id: BaseParam.MIND, value: 442 },
          { id: BaseParam.VITALITY, value: 339 }
        ]
      }
    ];

    statsEntries.forEach(entry => {
      const stats = service.getRelevantBaseStats(entry.job)
        .reduce((acc, baseParamId) => {
          acc[baseParamId] = service.getBaseValue(baseParamId, entry.job, entry.level, entry.tribe);
          return acc;
        }, {});

      entry.stats.forEach(stat => {
        expect(stats[stat.id]).toBeCloseTo(stat.value,
          -1,
          `${BaseParam[stat.id]}, lvl ${entry.level}, job ${entry.job}, tribe ${entry.tribe}`);
      });
    });
  }));


});
