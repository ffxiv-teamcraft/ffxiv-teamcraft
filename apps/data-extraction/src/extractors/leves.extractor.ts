import { AbstractExtractor } from '../abstract-extractor';

export class LevesExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const leves = {};
    this.getAllPages('https://xivapi.com/Leve?columns=ID,Name_*,ClassJobCategory.Name_*,ClassJobLevel,CraftLeve').subscribe(page => {
      page.Results.forEach(leve => {
        leves[leve.ID] = {
          en: leve.Name_en,
          ja: leve.Name_ja,
          de: leve.Name_de,
          fr: leve.Name_fr,
          job: {
            en: leve.ClassJobCategory.Name_en,
            ja: leve.ClassJobCategory.Name_ja,
            de: leve.ClassJobCategory.Name_de,
            fr: leve.ClassJobCategory.Name_fr
          },
          lvl: leve.ClassJobLevel,
          items: leve.CraftLeve ? [0, 1, 2, 3]
            .filter(i => leve.CraftLeve[`Item${i}`] !== null)
            .map(i => {
              return {
                itemId: leve.CraftLeve[`Item${i}TargetID`],
                amount: leve.CraftLeve[`ItemCount${i}`]
              };
            }) : []
        };
      });
    }, null, () => {
      this.persistToJsonAsset('leves', leves);
      this.done();
    });
  }

  getName(): string {
    return 'leves';
  }

}
