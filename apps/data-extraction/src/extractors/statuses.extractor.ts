import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';
import { combineLatest } from 'rxjs';

export class StatusesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const statuses = {};
    combineLatest([
      this.getSheet(xiv, 'Status', ['Name_*', 'Description_*', 'Icon', 'Level', 'ClassJob#', 'ClassJobCategory#', 'MaxStacks'])
    ]).subscribe(([rows]) => {
      rows.forEach((status) => {
        statuses[status.index] = {
          en: status.Name_en,
          de: status.Name_de,
          ja: status.Name_ja,
          fr: status.Name_fr,
          icon: status.Icon,
          maxStacks: status.MaxStacks,
          description: {
            en: status.Description_en,
            de: status.Description_de,
            ja: status.Description_ja,
            fr: status.Description_fr
          }
        };
      });
      this.persistToJsonAsset('statuses', statuses);
      this.done();
    });
  }

  getName(): string {
    return 'statuses';
  }

}
