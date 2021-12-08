import { AbstractExtractor } from './abstract-extractor';
import { CompactMasterbook } from '../../../../model/common/compact-masterbook';
import { getItemSource, ListRow } from '../../model/list-row';
import { DataType } from '../data-type';

export class MasterbooksExtractor extends AbstractExtractor<CompactMasterbook[]> {

  getDataType(): DataType {
    return DataType.MASTERBOOKS;
  }

  isAsync(): boolean {
    return false;
  }

  public getRequirements(): DataType[] {
    return [DataType.CRAFTED_BY];
  }

  protected doExtract(itemId: number, row?: ListRow): CompactMasterbook[] {
    const res: CompactMasterbook[] = [];
    if (getItemSource(row, DataType.CRAFTED_BY).length > 0) {
      for (const craft of getItemSource(row, DataType.CRAFTED_BY)) {
        if (craft.masterbook !== undefined) {
          if (!res.some(m => m.id === craft.masterbook.id)) {
            const book = craft.masterbook;
            if (book.id.toString().indexOf('draft') > -1) {
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
    const gatheredBy = getItemSource(row, DataType.GATHERED_BY, true);
    if (gatheredBy.type !== undefined && gatheredBy.nodes[0] !== undefined && gatheredBy.nodes[0].folklore) {
      res.push({
        id: gatheredBy.nodes[0].folklore
      });
    }
    return res;
  }

}
