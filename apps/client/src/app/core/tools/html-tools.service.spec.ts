import { inject, TestBed } from '@angular/core/testing';

import { HtmlToolsService } from './html-tools.service';

describe('HtmlToolsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HtmlToolsService]
    });
  });

  it('should be created', inject([HtmlToolsService], (service: HtmlToolsService) => {
    expect(service).toBeTruthy();
  }));

  it('should generate stars properly', inject([HtmlToolsService], (service: HtmlToolsService) => {
    expect(service.generateStars(3)).toEqual('★★★');
  }));
});
