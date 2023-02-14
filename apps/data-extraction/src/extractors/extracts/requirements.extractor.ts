import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';
import { DataType, Ingredient } from '@ffxiv-teamcraft/types';

export class RequirementsExtractor extends AbstractItemDetailsExtractor<Ingredient[]> {
  hwdInspections = this.requireLazyFile('hwdInspections');

  collectables = this.requireLazyFile('collectables');

  doExtract(itemId: number, sources: { type: DataType; data: any }[]): Ingredient[] {
    const tradeSources = this.getItemSource(sources, DataType.TRADE_SOURCES);
    // Ishgard inspections
    if (tradeSources?.length === 1 && tradeSources[0].npcs[0]?.id === 1031693) {
      const inspection = this.hwdInspections.find(r => {
        return r.receivedItem === itemId;
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
    if (tradeSources?.length === 1 && tradeSources[0].npcs[0]?.id === 1032900) {
      const collectableReward = Object.entries(this.collectables).find(([, c]) => {
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
    if (tradeSources?.length === 1 && ['Submersible Frames', 'Items of Interest'].some(name => tradeSources[0].shopName?.en === name)) {
      const trade = tradeSources[0].trades[0];
      return [{
        id: trade.currencies[0].id,
        amount: trade.currencies[0].amount
      }];
    }
    return [];
  }

  getDataType(): DataType {
    return DataType.REQUIREMENTS;
  }

}
