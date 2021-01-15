import { AbstractExtractor } from '../abstract-extractor';

export class FoodsExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const foods = [];
    this.getAllPages('https://xivapi.com/Search?indexes=items&filters=ItemSearchCategory.ID=45&columns=ID,Bonuses,LevelItem,LevelEquip').subscribe(page => {
      page.Results.forEach(entry => {
        if (entry.Bonuses) {
          foods.push(entry);
        }
      });
    }, null, () => {
      this.persistToJsonAsset('foods', foods);
      this.done();
    });
  }

  getName(): string {
    return 'foods';
  }

}
