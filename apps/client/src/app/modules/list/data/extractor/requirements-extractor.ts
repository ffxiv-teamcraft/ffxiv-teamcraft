import { AbstractExtractor } from './abstract-extractor';
import { DataType } from '../data-type';
import { getItemSource, ListRow } from '../../model/list-row';
import { Ingredient } from '../../../../model/garland-tools/ingredient';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class RequirementsExtractor extends AbstractExtractor<Ingredient[]> {
  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  getDataType(): DataType {
    return DataType.REQUIREMENTS;
  }

  isAsync(): boolean {
    return true;
  }

  protected doExtract(itemId: number, row: ListRow): Observable<Ingredient[]> {
    const tradeSources = getItemSource(row, DataType.TRADE_SOURCES);
    return combineLatest([
      this.lazyData.getEntry('hwdInspections'),
      this.lazyData.getEntry('collectables')
    ]).pipe(
      map(([hwdInspections, collectables]) => {

        // Ishgard inspections
        if (tradeSources.length === 1 && tradeSources[0].npcs[0]?.id === 1031693) {
          const inspection = hwdInspections.find(r => {
            return r.receivedItem === row.id;
          });
          if (inspection) {
            return [{
              id: inspection.requiredItem,
              amount: 1,
              batches: inspection.amount
            }];
          }
        }
        // Collectable Rewards
        if (tradeSources.length === 1 && tradeSources[0].npcs[0]?.id === 1032900) {
          const collectableReward = Object.entries(collectables).find(([, c]) => {
            return c.reward === itemId;
          });
          if (collectableReward) {
            return [{
              id: +collectableReward[0],
              amount: 1,
              batches: +collectableReward[1].mid.scrip
            }];
          }
        }
        // Modified airships
        if (tradeSources.length === 1 && tradeSources[0].shopName?.en === 'Submersible Frames') {
          const trade = tradeSources[0].trades[0];
          return [{
            id: trade.currencies[0].id,
            amount: trade.currencies[0].amount
          }];
        }
        return [];
      })
    );
  }

}
