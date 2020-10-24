import { TestBed } from '@angular/core/testing';
import { WeatherService } from './weather.service';
import { EorzeanTimeService } from './eorzean-time.service';

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WeatherService
      ]
    });
    service = TestBed.inject(WeatherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be able to find a weather spawn in lakeland', () => {
    // Was breaking on 10/21/2020 around 4:30PM
    expect(service.getNextWeatherStart(491, 4, 1603289716731 * EorzeanTimeService.EPOCH_TIME_FACTOR)).not.toBeNull();
  });
});
