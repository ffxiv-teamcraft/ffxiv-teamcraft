import { AbstractExtractor } from './abstract-extractor';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { LazyDataService } from '../../../../core/data/lazy-data.service';

export class AchievementsExtractor extends AbstractExtractor<number[]> {
  constructor(gt: GarlandToolsService, private lazyData: LazyDataService) {
    super(gt);
  }

  getDataType(): DataType {
    return DataType.ACHIEVEMENTS;
  }

  isAsync(): boolean {
    return false;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item): number[] {
    return Object.keys(this.lazyData.data.achievements)
      .filter(key => {
        const achievement = this.lazyData.data.achievements[key];
        return achievement.itemReward === item.id;
      })
      .map(key => +key);
  }
}
