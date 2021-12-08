import { AbstractExtractor } from './abstract-extractor';
import { DataType } from '../data-type';
import { Observable } from 'rxjs';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';

export class AchievementsExtractor extends AbstractExtractor<number[]> {
  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  getDataType(): DataType {
    return DataType.ACHIEVEMENTS;
  }

  isAsync(): boolean {
    return true;
  }

  protected doExtract(itemId: number): Observable<number[]> {
    return this.lazyData.getEntry('achievements').pipe(
      map(achievements => {
        return Object.keys(achievements)
          .filter(key => {
            const achievement = achievements[key];
            return achievement.itemReward === itemId;
          })
          .map(key => +key);
      })
    );
  }
}
