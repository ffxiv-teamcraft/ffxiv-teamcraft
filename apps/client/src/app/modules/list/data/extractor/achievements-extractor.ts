import { AbstractExtractor } from './abstract-extractor';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { Observable } from 'rxjs';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';

export class AchievementsExtractor extends AbstractExtractor<number[]> {
  constructor(gt: GarlandToolsService, private lazyData: LazyDataFacade) {
    super(gt);
  }

  getDataType(): DataType {
    return DataType.ACHIEVEMENTS;
  }

  isAsync(): boolean {
    return true;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item): Observable<number[]> {
    return this.lazyData.getEntry('achievements').pipe(
      map(achievements => {
        return Object.keys(achievements)
          .filter(key => {
            const achievement = achievements[key];
            return achievement.itemReward === item.id;
          })
          .map(key => +key);
      })
    );
  }
}
