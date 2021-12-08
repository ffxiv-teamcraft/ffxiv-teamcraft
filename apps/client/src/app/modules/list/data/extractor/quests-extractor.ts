import { AbstractExtractor } from './abstract-extractor';
import { DataType } from '../data-type';
import { Observable } from 'rxjs';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';

export class QuestsExtractor extends AbstractExtractor<number[]> {
  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  getDataType(): DataType {
    return DataType.QUESTS;
  }

  isAsync(): boolean {
    return true;
  }

  protected doExtract(itemId: number): Observable<number[]> {
    return this.lazyData.getEntry('quests').pipe(
      map(quests => {
        return Object.keys(quests)
          .filter(key => {
            const quest = quests[key];
            return quest.rewards?.some(reward => reward.id === itemId)
              || quest.trades?.some(t => t.items.some(reward => reward.id === itemId));
          })
          .map(key => +key);
      })
    );
  }
}
