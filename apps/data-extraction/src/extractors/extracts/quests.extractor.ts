import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';
import { DataType } from '@ffxiv-teamcraft/types';

export class QuestsExtractor extends AbstractItemDetailsExtractor<number[]> {
  quests = this.requireLazyFile('quests');

  doExtract(itemId: number): number[] {
    return Object.keys(this.quests)
      .filter(key => {
        const quest = this.quests[key];
        return quest.rewards?.some(reward => reward.id === itemId)
          || quest.trades?.some(t => t.items.some(reward => reward.id === itemId));
      })
      .map(key => +key);
  }

  getDataType(): DataType {
    return DataType.QUESTS;
  }

}
