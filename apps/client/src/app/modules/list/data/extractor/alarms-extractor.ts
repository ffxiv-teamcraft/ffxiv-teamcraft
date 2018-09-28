import { AbstractExtractor } from './abstract-extractor';
import { Alarm } from '../../../../core/alarms/alarm';
import { Item } from '../../../../model/garland-tools/item';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { ListRow } from '../../model/list-row';

export class AlarmsExtractor extends AbstractExtractor<Alarm[]> {
  constructor() {
    super();
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item, itemData: ItemData, row: ListRow): Alarm[] {
    // TODO
    return [];
  }

  getDataType(): DataType {
    return DataType.ALARMS;
  }

  isAsync(): boolean {
    return false;
  }

}
