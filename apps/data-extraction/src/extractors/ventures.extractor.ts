import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class VenturesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const ventures = {};
    const retainerTasks = [];
    this.getSheet<any>(xiv, 'RetainerTask',
      [
        'IsRandom', 'Experience',
        'Task.Name*', 'Task.Item.Name*', 'Task.Quantity',
        'RequiredGathering', 'RequiredItemLevel', 'RetainerLevel', 'RetainerTaskParameter',
        'VentureCost', 'ClassJobCategory#', 'Quantity'], false, 2)
      .subscribe(tasks => {
        tasks.forEach(task => {
          if (task.IsRandom) {
            ventures[task.index] = {
              en: task.Task.Name_en,
              ja: task.Task.Name_ja,
              de: task.Task.Name_de,
              fr: task.Task.Name_fr
            };
          } else if (task.Task && task.Task.Item && task.Task.Quantity[0] > 0) {
            let reqStat = 'ilvl';
            if (task.ClassJobCategory !== 34) {
              reqStat = 'perception';
            }
            let reqStatValue = 'ItemLevelDoW';
            if (task.ClassJobCategory !== 34) {
              if (task.ClassJobCategory === 19) {
                reqStatValue = 'PerceptionFSH';
              } else {
                reqStatValue = 'PerceptionDoL';
              }
            }
            retainerTasks.push({
              id: task.index,
              exp: task.Experience,
              reqGathering: task.RequiredGathering,
              reqIlvl: task.RequiredItemLevel,
              lvl: task.RetainerLevel,
              cost: task.VentureCost,
              item: task.Task.Item.index,
              quantities: task.Task.Quantity.map((q, index) => {
                return {
                  quantity: q,
                  stat: reqStat,
                  value: task.RetainerTaskParameter ? task.RetainerTaskParameter[reqStatValue][index - 1] : 0
                };
              }),
              category: task.ClassJobCategory
            });
            if (task.Task.Item.Name_en) {
              ventures[task.index] = {
                en: task.Task.Item.Name_en,
                ja: task.Task.Item.Name_ja,
                de: task.Task.Item.Name_de,
                fr: task.Task.Item.Name_fr
              };
            }
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
