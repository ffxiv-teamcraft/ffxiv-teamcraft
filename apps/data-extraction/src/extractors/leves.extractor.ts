import { AbstractExtractor } from '../abstract-extractor';

export class LevesExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const leves = {};
    const levesPerItem = {};
    this.getAllPages('https://xivapi.com/Leve?columns=ID,Name_*,ClassJobCategory.Name_*,ClassJobLevel,CraftLeve,ClassJobCategoryTargetID').subscribe(page => {
      page.Results.forEach(leve => {
        if (leve.CraftLeve) {
          [0, 1, 2, 3]
            .filter(i => leve.CraftLeve[`Item${i}`] !== null)
            .forEach(i => {
              const itemId = leve.CraftLeve[`Item${i}TargetID`];
              levesPerItem[itemId] = [...(levesPerItem[itemId] || []), {
                leve: leve.ID,
                amount: leve.CraftLeve[`ItemCount${i}`],
                lvl: leve.ClassJobLevel,
                classJob: leve.ClassJobCategoryTargetID
              }];
            });
        }
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
      this.persistToJsonAsset('leves-per-item', levesPerItem);
      this.done();
    });
  }

  getName(): string {
    return 'leves';
  }

}
