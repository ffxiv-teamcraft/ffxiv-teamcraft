import { AbstractExtractor } from '../abstract-extractor';

export class FatesExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const fates = {};
    this.getAllPages('https://xivapi.com/Fate?columns=ID,Name_*,Description_*,IconMap,ClassJobLevel,Location').subscribe(page => {
      page.Results.forEach(fate => {
        fates[fate.ID] = {
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
          icon: fate.IconMap,
          level: fate.ClassJobLevel,
          location: fate.Location
        };
      });
    }, null, () => {
      this.persistToJsonAsset('fates', fates);
      this.done()
    });
  }

  getName(): string {
    return 'fates';
  }

}
