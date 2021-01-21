import { AbstractExtractor } from '../abstract-extractor';

export class CombosExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const traits = {};
    this.getAllPages('https://xivapi.com/Trait?columns=ID,Name_*,Description_*,Icon').subscribe(page => {
      page.Results.forEach(trait => {
        traits[trait.ID] = {
          en: trait.Name_en,
          de: trait.Name_de,
          ja: trait.Name_ja,
          fr: trait.Name_fr,
          icon: trait.Icon,
          description: {
            en: trait.Description_en,
            de: trait.Description_de,
            ja: trait.Description_ja,
            fr: trait.Description_fr
          }
        };
      });
    }, null, () => {
      this.persistToJsonAsset('traits', traits);
      this.done();
    });
  }

  getName(): string {
    return 'traits';
  }

}
