import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';
import { DataType } from '@ffxiv-teamcraft/types';
import { uniq } from 'lodash';

export class QuestsExtractor extends AbstractItemDetailsExtractor<number[]> {
  quests = this.requireLazyFile('quests');

  allaganReportQuests = this.requireLazyFile('questSources');

  doExtract(itemId: number): number[] {
    return uniq([
      ...Object.keys(this.quests)
        .filter(key => {
          const quest = this.quests[key];
          return quest.rewards?.some(reward => reward.id === itemId)
            || quest.trades?.some(t => t.items.some(reward => reward.id === itemId));
        })
        .map(key => +key),
      ...(this.allaganReportQuests[itemId] as unknown as number[] || [])
    ]);
  }

  getDataType(): DataType {
    return DataType.QUESTS;
  }

}
