import { TestBed } from '@angular/core/testing';

import { GearsetComparatorService } from './gearset-comparator.service';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { LazyDataTestService } from '../../../test/lazy-data-test-service';
import { MateriaService } from './materia.service';
import { StatsService } from './stats.service';

describe('GearsetComparatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: LazyDataService, useFactory: () => new LazyDataTestService() },
      MateriaService,
      StatsService
    ]
  }));

  it('should be created', () => {
    const service: GearsetComparatorService = TestBed.get(GearsetComparatorService);
    expect(service).toBeTruthy();
  });
});
