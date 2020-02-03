import { TestBed } from '@angular/core/testing';

import { GearsetComparatorService } from './gearset-comparator.service';

describe('GearsetComparatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GearsetComparatorService = TestBed.get(GearsetComparatorService);
    expect(service).toBeTruthy();
  });
});
