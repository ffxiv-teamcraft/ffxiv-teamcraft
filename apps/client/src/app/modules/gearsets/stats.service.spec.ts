import { inject, TestBed } from '@angular/core/testing';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { LazyDataTestService } from '../../../test/lazy-data-test-service';
import { StatsService } from './stats.service';
import { BaseParam } from './base-param';

describe('StatsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LazyDataService, useFactory: () => new LazyDataTestService() },
        StatsService
      ]
    });
  });

  it('should be created', inject([StatsService], (service: StatsService) => {
    expect(service).toBeTruthy();
  }));

  it('should get base stats for WHM accurately', inject([StatsService], (service: StatsService) => {
    const statsEntries = [
      {
        job: 24,
        level: 73,
        stats: [
          { id: BaseParam.MIND, value: 401 },
          { id: BaseParam.DIRECT_HIT_RATE, value: 367 },
          { id: BaseParam.CRITICAL_HIT, value: 367 },
          { id: BaseParam.DETERMINATION, value: 305 },
          { id: BaseParam.SPELL_SPEED, value: 367 },
          { id: BaseParam.PIETY, value: 305 },
          { id: BaseParam.VITALITY, value: 304, precision: -1 }
        ]
      }
    ];

    statsEntries.forEach(entry => {
      const stats = service.getRelevantBaseStats(entry.job)
        .reduce((acc, baseParamId) => {
          acc[baseParamId] = service.getBaseValue(baseParamId, entry.job, entry.level);
          return acc;
        }, {});

      entry.stats.forEach(stat => {
        expect(stats[stat.id]).toBeCloseTo(stat.value, stat.precision || 0);
      });
    });
  }));


});
