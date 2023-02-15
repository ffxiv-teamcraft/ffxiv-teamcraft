import { DataType } from '@ffxiv-teamcraft/types';
import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';

export class DeprecatedExtractor extends AbstractItemDetailsExtractor<boolean> {
  deprecatedIndex = this.requireLazyFile('deprecatedItems');

  doExtract(itemId: number): boolean {
    return this.deprecatedIndex[itemId]?.length > 0;
  }

  getDataType(): DataType {
    return DataType.DEPRECATED;
  }

}
