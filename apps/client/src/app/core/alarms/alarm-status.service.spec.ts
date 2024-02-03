import { TestBed } from '@angular/core/testing';
import { AlarmStatusService } from './alarm-status.service';

describe('AlarmStatusService', () => {

  let service: AlarmStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlarmStatusService]
    });

    service = TestBed.inject(AlarmStatusService);
  });

  it('Can find next spawn for basic use cases', () => {
    const next = service.findNextTime(new Date('05/08/3078 15:35GMT'), 17);
    expect(next.getUTCHours()).toBe(17);
    expect(next.getUTCMinutes()).toBe(0);
    expect(next.getUTCDay()).toBe(5);
  });
});
