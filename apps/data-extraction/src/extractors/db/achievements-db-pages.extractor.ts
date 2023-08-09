import { AbstractExtractor } from '../../abstract-extractor';
import { XivDataService } from '../../xiv/xiv-data.service';

export class AchievementsDbPagesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): void {
    this.getSheet(xiv, 'Achievement', ['Name', 'Description', 'Title#', 'Item#', 'Icon'])
      .subscribe(achievements => {
        const pages = this.extendNames(achievements, [
          {
            field: 'Name',
            koSource: 'koAchievements',
            zhSource: 'zhAchievements'
          },
          {
            field: 'Description',
            koSource: 'koAchievementDescriptions',
            zhSource: 'zhAchievementDescriptions',
            targetField: 'description'
          }
        ]).reduce((acc, { row, extended }) => {
          return {
            ...acc,
            [row.index]: {
              id: row.index,
              icon: row.Icon,
              patch: this.findPatch('achievement', row.index),
              ...extended,
              item: row.Item,
              title: row.Title
            }
          };
        }, {});
        this.persistToJsonAsset('db/achievements-database-pages', pages);
        this.done();
      });
  }

  getName(): string {
    return 'achievements-db-pages';
  }

}
