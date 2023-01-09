import { AbstractExtractor } from '../abstract-extractor';
import { combineLatest } from 'rxjs';
import { XivDataService } from '../xiv/xiv-data.service';

export class ItemSeriesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    combineLatest([
      this.getSheet(xiv, 'ItemSeries', ['Name']),
      this.getSheet(xiv, 'Item', ['ItemSeries'])
    ]).subscribe(([itemSeries, items]) => {
      const entities = {};
      itemSeries.forEach(is => {
        if (is.index === 0) {
          return;
        }
        entities[is.index] = {
          en: is.Name_en,
          ja: is.Name_ja,
          de: is.Name_de,
          fr: is.Name_fr,
          items: items.filter(i => i.ItemSeries === is.index).map(i => i.index)
        };
      });
      this.persistToJsonAsset('item-series', entities);
      this.done();
    });
  }

  getName(): string {
    return 'item-series';
  }

}
