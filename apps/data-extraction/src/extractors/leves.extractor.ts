import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class LevesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const leves = {};
    const levesPerItem = {};
    this.getSheet<any>(xiv, 'Leve', ['Name', 'ClassJobCategory.Name', 'ClassJobLevel', 'CraftLeve', 'ClassJobCategory#', 'DataId.Item#', 'DataId.ItemCount'], false, 1)
      .subscribe(entries => {
        entries.forEach(leve => {
          if (leve.DataId.__sheet === 'CraftLeve') {
            leve.DataId.Item
              .filter(i => i > 0)
              .forEach((itemId, i) => {
                levesPerItem[itemId] = [...(levesPerItem[itemId] || []), {
                  leve: leve.index,
                  amount: leve.DataId.ItemCount[i],
                  lvl: leve.ClassJobLevel,
                  classJob: leve.ClassJobCategory.index
                }];
              });
          }
          leves[leve.index] = {
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
            items: leve.DataId.__sheet === 'CraftLeve' ? leve.DataId.Item
              .filter(item => item > 0)
              .map((item, i) => {
                return {
                  itemId: item,
                  amount: leve.DataId.ItemCount[i]
                };
              }) : []
          };
        });
        this.persistToJsonAsset('leves', leves);
        this.persistToJsonAsset('leves-per-item', levesPerItem);
        this.done();
      });
  }

  getName(): string {
    return 'leves';
  }

}
