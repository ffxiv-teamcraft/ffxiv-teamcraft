import { AbstractExtractor } from './abstract-extractor';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { Observable } from 'rxjs';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';

export class QuestsExtractor extends AbstractExtractor<number[]> {
  constructor(gt: GarlandToolsService, private lazyData: LazyDataFacade) {
    super(gt);
  }

  getDataType(): DataType {
    return DataType.QUESTS;
  }

  isAsync(): boolean {
    return true;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item): Observable<number[]> {
    return this.lazyData.getEntry('quests').pipe(
      map(quests => {
        return Object.keys(quests)
          .filter(key => {
            const quest = quests[key];
            return quest.rewards?.some(reward => reward.id === item.id)
              || quest.trades?.some(t => t.items.some(reward => reward.id === item.id));
          })
          .map(key => +key);
      })
    );
  }
}
