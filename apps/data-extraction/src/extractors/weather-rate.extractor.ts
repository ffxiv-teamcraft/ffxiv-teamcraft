import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class WeatherRateExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const weatherIndexData = {};

    this.getSheet<any>(xiv, 'WeatherRate', ['Rate', 'Weather']).subscribe(weatherIndexes => {
      weatherIndexes.forEach(weatherIndex => {
        const entry = [];
        let previousRate = 0;
        weatherIndex.Rate.forEach((rate, i) => {
          const rateValue = rate + previousRate;
          previousRate = rateValue;
          if (rate > 0) {
            entry.push({ rate: rateValue, weatherId: weatherIndex.Weather[i] });
          }
        });
        weatherIndexData[weatherIndex.index] = entry;
      });
      this.persistToTypescript('weather-index', 'weatherIndex', weatherIndexData);
      this.done();
    });
  }

  getName(): string {
    return 'weather-rates';
  }

}
