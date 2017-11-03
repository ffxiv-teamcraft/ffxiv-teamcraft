import { TestBed, inject } from '@angular/core/testing';

import { PatreonService } from './patreon.service';

describe('PatreonService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PatreonService]
    });
  });

  it('should be created', inject([PatreonService], (service: PatreonService) => {
    expect(service).toBeTruthy();
  }));
});
