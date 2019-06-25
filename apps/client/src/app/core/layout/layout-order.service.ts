import { LayoutRowOrder } from './layout-row-order.enum';
import { Injectable } from '@angular/core';
import { ListRow } from '../../modules/list/model/list-row';
import { TranslateService } from '@ngx-translate/core';
import { LocalizedDataService } from '../data/localized-data.service';
import { craftingLog } from '../data/sources/crafting-log';
import { I18nToolsService } from '../tools/i18n-tools.service';

@Injectable()
export class LayoutOrderService {

  private static JOBS = [
    'carpenter',
    'blacksmith',
    'armorer',
    'goldsmith',
    'leatherworker',
    'weaver',
    'alchemist',
    'culinarian',
    'miner',
    'botanist',
    'fisher'
  ];


  private orderFunctions: { [index: string]: (rowA: ListRow, rowB: ListRow) => number } = {
    'NAME': (a, b) => {
      let aName: string = this.i18n.getName(this.localizedData.getItem(a.id));
      let bName: string = this.i18n.getName(this.localizedData.getItem(b.id));
      if (aName === bName) {
        // If this happens, it means that they are the same item with different recipe,
        // let's just add recipe id to distinguish them.
        aName += a.recipeId;
        bName += b.recipeId;
      }
      return aName > bName ? 1 : -1;
    },
    'LEVEL': (a, b) => {
      const aLevel = this.getLevel(a);
      const bLevel = this.getLevel(b);
      // If same level, order by name for these two
      return aLevel === bLevel ? this.orderFunctions['NAME'](a, b) : aLevel - bLevel;
    },
    'JOB': (a, b) => {
      const aJobId = this.getJobId(a);
      const bJobId = this.getJobId(b);
      if (aJobId === bJobId) {
        const aIndex = this.getLogIndex(a);
        const bIndex = this.getLogIndex(b);
        if (aIndex > -1 && bIndex > -1 && aIndex !== bIndex) {
          return aIndex - bIndex;
        }
        return this.orderFunctions['LEVEL'](a, b);
      } else {
        return aJobId - bJobId;
      }
    }
  };

  constructor(private translate: TranslateService, private localizedData: LocalizedDataService,
              private i18n: I18nToolsService) {
  }

  public order(data: ListRow[], orderBy: string, order: LayoutRowOrder): ListRow[] {
    const ordering = this.orderFunctions[orderBy];
    if (ordering === undefined) {
      return data;
    }
    const orderedASC = (data || []).sort(ordering);
    return order === LayoutRowOrder.ASC ? orderedASC : orderedASC.reverse();
  }

  private getLogIndex(row: ListRow): number {
    if (row.craftedBy === undefined || row.craftedBy.length === 0) {
      return -1;
    }
    const craft = row.craftedBy[0];
    const logEntry = craftingLog[craft.jobId - 8];
    // Log entry is undefined if it's an airship
    if (logEntry === undefined) {
      return -1;
    }
    // We multiply index by craft.jobId because we want it to keep the job order too
    return logEntry.indexOf(+row.recipeId) * craft.jobId;
  }

  private getJobId(row: ListRow): number {
    if (row.craftedBy !== undefined && row.craftedBy.length > 0) {
      // Returns the lowest level available for the craft.
      const jobName = LayoutOrderService.JOBS.find(job => row.craftedBy[0].icon.indexOf(job) > -1);
      if (jobName !== undefined) {
        return LayoutOrderService.JOBS.indexOf(jobName);
      }
      return 0;
    }
    if (row.gatheredBy !== undefined) {
      const jobName = ['miner', 'miner', 'botanist', 'botanist', 'fisher'][row.gatheredBy.type];
      if (jobName !== undefined) {
        return LayoutOrderService.JOBS.indexOf(jobName);
      }
      return 0;
    }
    return 0;
  }

  private getLevel(row: ListRow): number {
    if (row.craftedBy !== undefined && row.craftedBy.length > 0) {
      // Returns the lowest level available for the craft.
      return row.craftedBy.map(craft => craft.level).sort((a, b) => a - b)[0];
    }
    if (row.gatheredBy !== undefined) {
      return row.gatheredBy.level;
    }
    return 0;
  }
}
