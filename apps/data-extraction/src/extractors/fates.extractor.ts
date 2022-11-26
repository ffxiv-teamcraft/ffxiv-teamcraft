import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';
import { makeIcon } from '../xiv/make-icon';

export class FatesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const fates = {};
    this.getSheet<any>(xiv, 'Fate', ['Name', 'Description', 'IconMap', 'ClassJobLevel', 'Location'])
      .subscribe(entries => {
        entries.forEach(fate => {
          fates[fate.index] = {
            name: {
              en: fate.Name_en,
              ja: fate.Name_ja,
              de: fate.Name_de,
              fr: fate.Name_fr
            },
            description: {
              en: fate.Description_en,
              ja: fate.Description_ja,
              de: fate.Description_de,
              fr: fate.Description_fr
            },
            icon: makeIcon(fate.IconMap),
            level: fate.ClassJobLevel,
            location: fate.Location
          };
        });
        this.persistToJsonAsset('fates', fates);
        this.done();
      });
  }

  getName(): string {
    return 'fates';
  }

}
