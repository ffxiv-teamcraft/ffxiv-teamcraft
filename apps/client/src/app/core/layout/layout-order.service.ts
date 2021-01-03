import { LayoutRowOrder } from './layout-row-order.enum';
import { Injectable } from '@angular/core';
import { getItemSource, ListRow } from '../../modules/list/model/list-row';
import { TranslateService } from '@ngx-translate/core';
import { LocalizedDataService } from '../data/localized-data.service';
import { I18nToolsService } from '../tools/i18n-tools.service';
import { DataType } from '../../modules/list/data/data-type';
import { LazyDataService } from '../data/lazy-data.service';

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
    },
    'SLOT': (a, b) => {
      const aSlot = this.lazyData.data.itemEquipSlotCategory[a.id] || 0;
      const bSlot = this.lazyData.data.itemEquipSlotCategory[b.id] || 0;
      if (aSlot === bSlot) {
        return this.orderFunctions['JOB'](a, b);
      } else {
        return aSlot - bSlot;
      }
    }
  };

  constructor(private translate: TranslateService, private localizedData: LocalizedDataService,
              private i18n: I18nToolsService, private lazyData: LazyDataService) {
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
    const craftedBy = getItemSource(row, DataType.CRAFTED_BY);
    if (craftedBy.length === 0) {
      return -1;
    }
    const craft = craftedBy[0];
    const logEntry = this.lazyData.data.craftingLog[craft.job - 8];
    // Log entry is undefined if it's an airship
    if (logEntry === undefined) {
      return -1;
    }
    // We multiply index by craft.jobId because we want it to keep the job order too
    return logEntry.indexOf(+row.recipeId) * craft.job;
  }

  private getJobId(row: ListRow): number {
    const craftedBy = getItemSource(row, DataType.CRAFTED_BY);
    const gatheredBy = getItemSource(row, DataType.GATHERED_BY);
    if (craftedBy.length > 0) {
      return craftedBy[0].job;
    }
    if (gatheredBy.type !== undefined) {
      return gatheredBy.type;
    }
    return 0;
  }

  private getLevel(row: ListRow): number {
    const craftedBy = getItemSource(row, DataType.CRAFTED_BY);
    const gatheredBy = getItemSource(row, DataType.GATHERED_BY);
    if (craftedBy.length > 0) {
      // Returns the lowest level available for the craft.
      return craftedBy.map(craft => craft.lvl).sort((a, b) => a - b)[0];
    }
    if (gatheredBy.type !== undefined) {
      return gatheredBy.level;
    }
    return 0;
  }
}
