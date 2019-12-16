import { AbstractExtractor } from './abstract-extractor';
import { CompactMasterbook } from '../../../../model/common/compact-masterbook';
import { Item } from '../../../../model/garland-tools/item';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { getItemSource, ListRow } from '../../model/list-row';
import { DataType } from '../data-type';
import { folklores } from '../../../../core/data/sources/folklores';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';

export class MasterbooksExtractor extends AbstractExtractor<CompactMasterbook[]> {

  constructor(gt: GarlandToolsService) {
    super(gt);
  }

  getDataType(): DataType {
    return DataType.MASTERBOOKS;
  }

  isAsync(): boolean {
    return false;
  }

  protected canExtract(item: Item): boolean {
    return item.hasNodes() || item.isCraft();
  }

  protected doExtract(item: Item, itemData: ItemData, row?: ListRow): CompactMasterbook[] {
    const res: CompactMasterbook[] = [];
    if (getItemSource(row, DataType.CRAFTED_BY).length > 0) {
      for (const craft of getItemSource(row, DataType.CRAFTED_BY)) {
        if (craft.masterbook !== undefined) {
          if (res.find(m => m.id === craft.masterbook.id) === undefined) {
            const book = craft.masterbook;
            if (book.id.toString().indexOf('draft') > -1) {
              res.push({
                ...craft.masterbook,
                name: itemData.getPartial(book.id.toString(), 'item').obj.n
              });
            } else {
              res.push(craft.masterbook);
            }
          }
        }
      }
    }
    if (getItemSource(row, DataType.GATHERED_BY, true).type !== undefined) {
      const folklore = Object.keys(folklores).find(id => folklores[id].indexOf(row.id) > -1);
      if (folklore !== undefined) {
        res.push({
          id: +folklore,
          icon: [7012, 7012, 7127, 7127, 7128, 7128][getItemSource(row, DataType.CRAFTED_BY, true).type]
        });
      }
    }
    return res;
  }

}
