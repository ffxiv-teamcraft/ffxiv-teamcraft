import { LayoutRowOrder } from './layout-row-order.enum';
import { Injectable } from '@angular/core';
import { getItemSource, ListRow } from '../../modules/list/model/list-row';
import { TranslateService } from '@ngx-translate/core';
import { I18nToolsService } from '../tools/i18n-tools.service';
import { DataType } from '../../modules/list/data/data-type';
import { AlarmsFacade } from '../alarms/+state/alarms.facade';
import { Alarm } from '../alarms/alarm';
import { EorzeanTimeService } from '../eorzea/eorzean-time.service';
import { MathTools } from '../../tools/math-tools';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { safeCombineLatest } from '../rxjs/safe-combine-latest';

interface ListRowSortComparison {
  name: string;
  level: number;
  job: number;
  slot: number;
  timer: number;
  log: number;
}

@Injectable()
export class LayoutOrderService {


  private orderFunctions: { [index: string]: (rowA: ListRowSortComparison, rowB: ListRowSortComparison) => number } = {
    'NAME': (a, b) => {
      return a.name > b.name ? 1 : -1;
    },
    'LEVEL': (a, b) => {
      const aLevel = a.level;
      const bLevel = b.level;
      // If same level, order by name for these two
      if (aLevel === bLevel) {
        return this.orderFunctions['NAME'](a, b);
      }
      return aLevel - bLevel;
    },
    'JOB': (a, b) => {
      const aJobId = a.job;
      const bJobId = b.job;
      if (aJobId === bJobId) {
        if (a.log > -1 && b.log > -1 && a.log !== b.log) {
          return a.log - b.log;
        }
        return this.orderFunctions['LEVEL'](a, b);
      } else {
        return aJobId - bJobId;
      }
    },
    'SLOT': (a, b) => {
      if (a.slot === b.slot) {
        return this.orderFunctions['JOB'](a, b);
      } else {
        return a.slot - b.slot;
      }
    },
    'TIMER': (a, b) => {
      if (a.timer === 0 || b.timer === 0) {
        return this.orderFunctions['NAME'](a, b);
      }
      return a.timer - b.timer;
    }
  };

  alarmsCache: Record<number, { expire: number, score: number }> = {};

  orderCache: Record<string, Observable<number[]>> = {};

  constructor(private translate: TranslateService, private i18n: I18nToolsService,
              private lazyData: LazyDataFacade, private alarmsFacade: AlarmsFacade,
              private etime: EorzeanTimeService) {
  }

  private getNextSpawn(alarms: Alarm[]): number {
    if (!this.alarmsCache[alarms[0].itemId] || this.alarmsCache[alarms[0].itemId].expire >= Date.now()) {
      // Now in eorzean time
      const eNow = this.etime.toEorzeanDate(new Date());
      const next = alarms
        .map(alarm => {
          return this.alarmsFacade.createDisplay(alarm, eNow).remainingTime;
        })
        .sort((a, b) => {
          return a - b;
        })[0] || 0;
      this.alarmsCache[alarms[0].itemId] = {
        expire: Date.now() + next * 60000,
        score: next
      };
    }
    return this.alarmsCache[alarms[0].itemId].score;
  }

  public order(data: ListRow[], orderBy: string, order: LayoutRowOrder): Observable<ListRow[]> {
    if (orderBy === 'TIMER') {
      return this.sortRows(data, orderBy, order);
    }
    const hash = MathTools.hashCode(`${orderBy}:${order};${data.map(d => `${d.id},${d.amount}`).join(';')}`);
    if (this.orderCache[hash] === undefined) {
      this.orderCache[hash] = this.sortRows(data, orderBy, order).pipe(
        map(ordered => this.toIndexArray(data, ordered))
      );
    }
    return this.orderCache[hash].pipe(
      map(cache => cache.map(index => data[index]))
    );
  }

  private sortRows(data: ListRow[], orderBy: string, order: LayoutRowOrder): Observable<ListRow[]> {
    return safeCombineLatest(data.map(row => this.getSortComparables(row).pipe(
      map(comparables => ({ row, comparables }))))
    ).pipe(
      map((rows) => {
        return rows
          .sort((a, b) => {
            if (this.orderFunctions[orderBy]) {
              return this.orderFunctions[orderBy](a.comparables, b.comparables);
            }
            return 0;
          })
          .map(({ row }) => row);
      }),
      map(sorted => order === LayoutRowOrder.ASC ? sorted : sorted.reverse())
    );
  }

  private getSortComparables(row: ListRow): Observable<ListRowSortComparison> {
    return combineLatest([
      this.i18n.getNameObservable('items', row.id),
      of(this.getLevel(row)),
      of(this.getJobId(row)),
      this.lazyData.getRow('itemEquipSlotCategory', row.id, 0),
      of(getItemSource(row, DataType.ALARMS)).pipe(
        map(alarms => alarms.length === 0 ? 0 : this.getNextSpawn(alarms))
      ),
      this.getLogIndex(row)
    ]).pipe(
      map(([name, level, job, slot, timer, log]) => {
        return { name, level, job, slot, timer, log };
      })
    );
  }

  private toIndexArray(before: ListRow[], after: ListRow[]): number[] {
    return after.map(row => before.indexOf(row));
  }

  private getLogIndex(row: ListRow): Observable<number> {
    const craftedBy = getItemSource(row, DataType.CRAFTED_BY);
    if (craftedBy.length === 0) {
      return of(-1);
    }
    const craft = craftedBy[0];
    return this.lazyData.getEntry('craftingLog').pipe(
      map(craftingLog => {
        const logEntry = craftingLog[craft.job - 8];
        // Log entry is undefined if it's an airship
        if (logEntry === undefined) {
          return -1;
        }
        // We multiply index by craft.jobId because we want it to keep the job order too
        return logEntry.indexOf(+row.recipeId) * craft.job;
      })
    );
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
