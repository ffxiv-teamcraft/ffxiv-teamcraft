import { AbstractExtractor } from './abstract-extractor';
import { Item } from '../../../../model/garland-tools/item';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { getItemSource, ListRow } from '../../model/list-row';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { LazyDataService } from '../../../../core/data/lazy-data.service';
import { Ingredient } from '../../../../model/garland-tools/ingredient';

export class RequirementsExtractor extends AbstractExtractor<Ingredient[]> {
  constructor(gt: GarlandToolsService, private lazyDataService: LazyDataService) {
    super(gt);
  }

  getDataType(): DataType {
    return DataType.REQUIREMENTS;
  }

  isAsync(): boolean {
    return false;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item, itemData: ItemData, row: ListRow): Ingredient[] {
    const tradeSources = getItemSource(row, DataType.TRADE_SOURCES);
    // Ishgard inspections
    if (tradeSources.length === 1 && tradeSources[0].npcs[0]?.id === 1031693) {
      const inspection = this.lazyDataService.data.hwdInspections.find(r => {
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
      const collectableReward = Object.entries<any>(this.lazyDataService.data.collectables).find(([, c]) => {
        return c.reward === item.id;
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
    if (tradeSources.length === 1 && tradeSources[0].shopName === 'Submersible Frames') {
      const trade = tradeSources[0].trades[0];
      return [{
        id: trade.currencies[0].id,
        amount: trade.currencies[0].amount
      }];
    }
    return [];
  }

}
