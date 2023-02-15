import { CompactMasterbook, DataType } from '@ffxiv-teamcraft/types';
import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';

export class MasterbooksExtractor extends AbstractItemDetailsExtractor<CompactMasterbook[]> {
  doExtract(itemId: number, sources: { type: DataType; data: any }[]): CompactMasterbook[] {
    const res: CompactMasterbook[] = [];
    if (this.getItemSource(sources, DataType.CRAFTED_BY)?.length > 0) {
      for (const craft of this.getItemSource(sources, DataType.CRAFTED_BY)) {
        if (craft.masterbook !== undefined) {
          if (!res.some(m => m.id === craft.masterbook.id)) {
            const book = craft.masterbook;
            if (book?.id.toString().indexOf('draft') > -1) {
              res.push({
                ...craft.masterbook
              });
            } else {
              res.push(craft.masterbook);
            }
          }
        }
      }
    }
    const gatheredBy = this.getItemSource(sources, DataType.GATHERED_BY);
    if (gatheredBy?.type !== undefined && gatheredBy.nodes[0] !== undefined && gatheredBy.nodes[0].folklore) {
      res.push({
        id: gatheredBy.nodes[0].folklore
      });
    }
    return res;
  }

  getDataType(): DataType {
    return DataType.MASTERBOOKS;
  }

}
