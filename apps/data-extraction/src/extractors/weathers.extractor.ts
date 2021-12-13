import { AbstractExtractor } from '../abstract-extractor';

export class WeathersExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const weathers = {};
    const icons = {};
    this.getAllPages('https://xivapi.com/Weather?columns=ID,Name_*,IconID').subscribe(page => {
      page.Results.forEach(weather => {
        icons[weather.ID] = weather.IconID;
        weathers[weather.ID] = {
          name: {
            en: weather.Name_en,
            ja: weather.Name_ja,
            de: weather.Name_de,
            fr: weather.Name_fr
          }
        };
      });
    }, null, () => {
      this.persistToJsonAsset('weathers', weathers);
      this.persistToTypescript('weather-icons', 'weatherIcons', icons);
      this.done();
    });
  }

  getName(): string {
    return 'weathers';
  }
}
