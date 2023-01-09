import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class WeathersExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const weathers = {};
    const icons = {};
    this.getSheet<any>(xiv, 'Weather', ['Name', 'Icon']).subscribe(entries => {
      entries.forEach(weather => {
        icons[weather.index] = weather.IconID;
        weathers[weather.index] = {
          name: {
            en: weather.Name_en,
            ja: weather.Name_ja,
            de: weather.Name_de,
            fr: weather.Name_fr
          }
        };
      });
      this.persistToJsonAsset('weathers', weathers);
      this.persistToTypescript('weather-icons', 'weatherIcons', icons);
      this.done();
    });
  }

  getName(): string {
    return 'weathers';
  }
}
