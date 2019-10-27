import { AbstractExtractor } from './abstract-extractor';
import { CompactMasterbook } from '../../../../model/common/compact-masterbook';
import { Item } from '../../../../model/garland-tools/item';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { ListRow } from '../../model/list-row';
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
    if (row.craftedBy !== undefined) {
      for (const craft of row.craftedBy) {
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
    if (row.gatheredBy !== undefined) {
      const folklore = Object.keys(folklores).find(id => folklores[id].indexOf(row.id) > -1);
      if (folklore !== undefined) {
        res.push({
          id: +folklore,
          icon: [7012, 7012, 7127, 7127, 7128, 7128][row.gatheredBy.type]
        });
      }
    }
    return res;
  }

}
