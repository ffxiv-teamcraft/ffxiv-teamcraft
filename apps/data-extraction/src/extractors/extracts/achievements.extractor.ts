import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';
import { DataType } from '@ffxiv-teamcraft/types';

export class AchievementsExtractor extends AbstractItemDetailsExtractor<number[]> {
  achievements = this.requireLazyFile('achievements');

  doExtract(itemId: number): number[] {
    return Object.keys(this.achievements)
      .filter(key => {
        const achievement = this.achievements[key];
        return achievement.itemReward === itemId;
      })
      .map(key => +key);
  }

  getDataType(): DataType {
    return DataType.ACHIEVEMENTS;
  }

}
