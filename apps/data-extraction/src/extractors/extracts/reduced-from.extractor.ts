import { DataType } from '@ffxiv-teamcraft/types';
import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';

export class ReducedFromExtractor extends AbstractItemDetailsExtractor<number[]> {
  reduction = this.requireLazyFile('reduction');

  aetherialReduce = this.requireLazyFile('aetherialReduce');

  doExtract(itemId: number): number[] {
    const reductionRow = this.reduction[itemId];
    if (!reductionRow) {
      return [];
    }
    return reductionRow.map(id => {
      return this.aetherialReduce[itemId] ? id : -1;
    }).filter(r => r > 0);
  }

  getDataType(): DataType {
    return DataType.REDUCED_FROM;
  }

}
