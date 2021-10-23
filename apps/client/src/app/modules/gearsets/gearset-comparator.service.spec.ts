import { TestBed } from '@angular/core/testing';

import { GearsetComparatorService } from './gearset-comparator.service';
import { MateriaService } from './materia.service';
import { StatsService } from './stats.service';

describe('GearsetComparatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      MateriaService,
      StatsService
    ]
  }));

  it('should be created', () => {
    const service: GearsetComparatorService = TestBed.get(GearsetComparatorService);
    expect(service).toBeTruthy();
  });
});
