import { AbstractExtractor } from '../abstract-extractor';

export class StatsExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const stats = [];
    this.getAllPages('https://xivapi.com/BaseParam?columns=ID,Name_*').subscribe(page => {
      page.Results.forEach(baseParam => {
        stats.push({
          id: baseParam.ID,
          en: baseParam.Name_en,
          de: baseParam.Name_de,
          ja: baseParam.Name_ja,
          fr: baseParam.Name_fr,
          filterName: baseParam.Name_en.split(' ').join('')
        });
      });
    }, null, () => {
      this.persistToTypescript('stats', 'stats', stats);
      this.done();
    });
  }

  getName(): string {
    return 'stats';
  }

}
