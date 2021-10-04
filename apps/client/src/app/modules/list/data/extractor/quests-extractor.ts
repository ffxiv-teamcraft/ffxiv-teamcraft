import { AbstractExtractor } from './abstract-extractor';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { LazyDataService } from '../../../../core/data/lazy-data.service';

export class QuestsExtractor extends AbstractExtractor<number[]> {
  constructor(gt: GarlandToolsService, private lazyData: LazyDataService) {
    super(gt);
  }

  getDataType(): DataType {
    return DataType.QUESTS;
  }

  isAsync(): boolean {
    return false;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item): number[] {
    return Object.keys(this.lazyData.data.quests)
      .filter(key => {
        const quest = this.lazyData.data.quests[key];
        return quest.rewards?.some(reward => reward.id === item.id)
          || quest.trades?.some(t => t.items.some(reward => reward.id === item.id));
      })
      .map(key => +key);
  }
}
