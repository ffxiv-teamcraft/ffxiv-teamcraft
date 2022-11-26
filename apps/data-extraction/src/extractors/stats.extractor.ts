import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class StatsExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const stats = [];
    this.getSheet<any>(xiv, 'BaseParam', ['Name']).subscribe(entries => {
      entries.forEach(baseParam => {
        stats.push({
          id: baseParam.index,
          en: baseParam.Name_en,
          de: baseParam.Name_de,
          ja: baseParam.Name_ja,
          fr: baseParam.Name_fr,
          filterName: baseParam.Name_en.split(' ').join('')
        });
      });
      this.persistToTypescript('stats', 'stats', stats);
      this.done();
    });
  }

  getName(): string {
    return 'stats';
  }

}
