import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';
import { DataType, XivapiPatch } from '@ffxiv-teamcraft/types';
import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';

export class SimpleDetailsExtractor<K extends keyof LazyData> extends AbstractItemDetailsExtractor<any> {

  data: LazyData[K];

  constructor(patches: XivapiPatch[], source: K, private dataType: DataType) {
    super(patches);
    this.data = this.requireLazyFile(source);
  }

  doExtract(itemId: number): any {
    return this.data[itemId];
  }

  getDataType(): DataType {
    return this.dataType;
  }

}
