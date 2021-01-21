import { AbstractExtractor } from '../abstract-extractor';

export class WeatherRateExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const weatherIndexes = [];

    const weatherIndexData = {};

    const weatherColumns = [
      'ID',
      'Rate0',
      'Rate1',
      'Rate2',
      'Rate3',
      'Rate4',
      'Rate5',
      'Rate6',
      'Rate7',
      'Weather0TargetID',
      'Weather1TargetID',
      'Weather2TargetID',
      'Weather3TargetID',
      'Weather4TargetID',
      'Weather5TargetID',
      'Weather6TargetID',
      'Weather7TargetID'
    ];

    this.getAllPages(`https://xivapi.com/weatherrate?columns=${weatherColumns.join(',')}`).subscribe(res => {
      weatherIndexes.push(...res.Results);
    }, null, () => {
      weatherIndexes.forEach(weatherIndex => {
        const entry = [];
        let previousRate = 0;
        for (let i = 0; i <= 7; i++) {
          const rate = weatherIndex[`Rate${i}`];
          const rateValue = rate + previousRate;
          previousRate = rateValue;
          if (rate > 0) {
            entry.push({ rate: rateValue, weatherId: weatherIndex[`Weather${i}TargetID`] });
          }
        }
        weatherIndexData[weatherIndex.ID] = entry;
      });
      this.persistToTypescript('weather-index', 'weatherIndex', weatherIndexData);
      this.done();
    });
  }

  getName(): string {
    return 'weather-rates';
  }

}
