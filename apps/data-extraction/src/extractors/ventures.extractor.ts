import { AbstractExtractor } from '../abstract-extractor';

export class VenturesExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const ventures = {};
    const retainerTasks = [];
    this.aggregateAllPages(`https://xivapi.com/RetainerTask?columns=ID,IsRandom,Task,Experience,RequiredGathering,RequiredItemLevel,RetainerLevel,RetainerTaskParameter,VentureCost,ClassJobCategoryTargetID,Quantity0,Quantity1,Quantity2,Quantity3,Quantity4`)
      .subscribe(tasks => {
        tasks.forEach(task => {
          if (task.IsRandom) {
            ventures[task.ID] = {
              en: task.Task.Name_en,
              ja: task.Task.Name_ja,
              de: task.Task.Name_de,
              fr: task.Task.Name_fr
            };
          } else if (task.Task && task.Task.Item) {
            let reqStat = 'ilvl';
            if (task.ClassJobCategoryTargetID !== 34) {
              reqStat = 'perception';
            }
            let reqStatValue = 'ItemLevelDoW';
            if (task.ClassJobCategoryTargetID !== 34) {
              if (task.ClassJobCategoryTargetID === 19) {
                reqStatValue = 'PerceptionFSH';
              } else {
                reqStatValue = 'PerceptionDoL';
              }
            }
            retainerTasks.push({
              id: task.ID,
              exp: task.Experience,
              reqGathering: task.RequiredGathering,
              reqIlvl: task.RequiredItemLevel,
              lvl: task.RetainerLevel,
              cost: task.VentureCost,
              item: task.Task.Item.ID,
              quantities: [0, 1, 2, 3, 4].map(index => {
                return {
                  quantity: task.Task[`Quantity${index}`],
                  stat: reqStat,
                  value: task.RetainerTaskParameter ? task.RetainerTaskParameter[`${reqStatValue}${index - 1}`] : 0
                };
              }),
              category: task.ClassJobCategoryTargetID
            });
            ventures[task.ID] = {
              en: task.Task.Item.Name_en,
              ja: task.Task.Item.Name_ja,
              de: task.Task.Item.Name_de,
              fr: task.Task.Item.Name_fr
            };
          }
        });
        this.persistToJsonAsset('ventures', ventures);
        this.persistToJsonAsset('retainer-tasks', retainerTasks);
        this.done();
      });
  }

  getName(): string {
    return 'ventures';
  }

}
