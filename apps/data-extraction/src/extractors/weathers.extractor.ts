import { AbstractExtractor } from '../abstract-extractor';

export class WeathersExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const weathers = {};
    this.getAllPages('https://xivapi.com/Weather?columns=ID,Name_*').subscribe(page => {
      page.Results.forEach(weather => {
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
      this.done();
    });
  }

  getName(): string {
    return 'weathers';
  }
}
