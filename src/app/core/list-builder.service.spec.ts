import { TestBed, inject } from '@angular/core/testing';

import { ListBuilderService } from './list-builder.service';

describe('ListBuilderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ListBuilderService]
    });
  });

  it('should be created', inject([ListBuilderService], (service: ListBuilderService) => {
    expect(service).toBeTruthy();
  }));
});
