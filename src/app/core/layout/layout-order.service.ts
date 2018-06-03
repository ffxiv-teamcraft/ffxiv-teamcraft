import {LayoutRowOrder} from './layout-row-order.enum';
import {Injectable} from '@angular/core';
import {ListRow} from '../../model/list/list-row';
import {TranslateService} from '@ngx-translate/core';
import {LocalizedDataService} from '../data/localized-data.service';

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
            const aName: string = this.localizedData.getItem(a.id)[this.translate.currentLang];
            const bName: string = this.localizedData.getItem(b.id)[this.translate.currentLang];
            return aName > bName ? 1 : -1;
        },
        'LEVEL': (a, b) => {
            const aLevel = this.getLevel(a);
            const bLevel = this.getLevel(b);
            const aName: string = this.localizedData.getItem(a.id)[this.translate.currentLang];
            const bName: string = this.localizedData.getItem(b.id)[this.translate.currentLang];
            // If same level, order by name for these two
            return aLevel === bLevel ? aName > bName ? 1 : -1 : aLevel - bLevel;
        },
        'JOB': (a, b) => {
            const aJobId = this.getJobId(a);
            const bJobId = this.getJobId(b);
            // If same job, order by level for these two
            const aLevel = this.getLevel(a);
            const bLevel = this.getLevel(b);
            // If same level, order by name
            const aName: string = this.localizedData.getItem(a.id)[this.translate.currentLang];
            const bName: string = this.localizedData.getItem(b.id)[this.translate.currentLang];
            if (aJobId === bJobId) {
                if (aLevel > bLevel) {
                    return 1;
                } else if (aLevel > bLevel) {
                    return -1;
                } else {
                    return aName > bName ? 1 : -1;
                }
            } else {
                return aJobId - bJobId;
            }
        }
    };

    constructor(private translate: TranslateService, private localizedData: LocalizedDataService) {
    }

    public order(data: ListRow[], orderBy: string, order: LayoutRowOrder): ListRow[] {
        const ordering = this.orderFunctions[orderBy];
        if (ordering === undefined) {
            return data;
        }
        const orderedASC = data.sort(ordering);
        return order === LayoutRowOrder.ASC ? orderedASC : orderedASC.reverse();
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
            const jobName = LayoutOrderService.JOBS.find(job => row.gatheredBy.icon.indexOf(job) > -1);
            if (jobName !== undefined) {
                return LayoutOrderService.JOBS.indexOf(jobName);
            }
            return 0;
        }
        return 0;
    }

    private getLevel(row: ListRow): number {
        if (row.craftedBy !== undefined) {
            // Returns the lowest level available for the craft.
            return row.craftedBy.map(craft => craft.level).sort((a, b) => a - b)[0];
        }
        if (row.gatheredBy !== undefined) {
            return row.gatheredBy.level;
        }
        return 0;
    }
}
