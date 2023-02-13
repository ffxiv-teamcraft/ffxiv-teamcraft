import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';
import { GatheredByExtractor } from './extracts/gathered-by.extractor';
import { AbstractItemDetailsExtractor } from './extracts/abstract-item-details-extractor';
import { map } from 'rxjs/operators';

export class ItemDetailsExtractExtractor extends AbstractExtractor {
  private extractors: AbstractItemDetailsExtractor<any>[] = [
    new GatheredByExtractor()
  ];


  constructor() {
    super();
  }

  protected doExtract(xiv: XivDataService): void {
    this.getSheet(xiv, 'Item', []).pipe(
      map(items => {
        return items.reduce((extracts, item) => {
          return {
            ...extracts,
            [item.index]: {
              id: item.index,
              sources: this.extractors.reduce((acc, extractor) => {
                const source = extractor.doExtract(item.index);
                if (item.index % 1000 === 0) {
                  console.log(item.index, 'done');
                }
                if (source) {
                  return [...acc, { type: extractor.getDataType(), data: source }];
                }
                return acc;
              }, [])
            }
          };
        }, {});
      })
    ).subscribe(extracts => {
      this.persistToJsonAsset('extracts-test', extracts);
      this.done();
    });
  }

  getName(): string {
    return 'extracts';
  }


}
