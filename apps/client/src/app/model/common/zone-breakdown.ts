import { ZoneBreakdownRow } from './zone-breakdown-row';
import { getItemSource, ListRow } from '../../modules/list/model/list-row';
import { tpWindowEntries } from '../../core/data/sources/tp-window-entries';
import { LayoutRowFilter } from '../../core/layout/layout-row-filter';
import { DataType } from '../../modules/list/data/data-type';

export class ZoneBreakdown {

  constructor(rows: ListRow[], filterChain?: string, hideZoneDuplicates = false) {
    rows.forEach(row => {
      if (getItemSource(row, DataType.GATHERED_BY, true).nodes !== undefined && getItemSource(row, DataType.GATHERED_BY, true).nodes.length !== 0
        && this.hasOneFilter(filterChain, LayoutRowFilter.IS_GATHERING, LayoutRowFilter.IS_GATHERED_BY_BTN, LayoutRowFilter.IS_GATHERED_BY_MIN, LayoutRowFilter.IS_GATHERED_BY_FSH)) {
        getItemSource(row, DataType.GATHERED_BY, true).nodes.forEach(node => {
          this.addToBreakdown(node.zoneid, node.mapid, row, hideZoneDuplicates);
        });
      } else if (getItemSource(row, DataType.DROPS).length > 0 && this.hasOneFilter(filterChain, LayoutRowFilter.IS_DUNGEON_DROP, LayoutRowFilter.IS_MONSTER_DROP)) {
        getItemSource(row, DataType.DROPS).forEach(drop => {
          this.addToBreakdown(drop.zoneid, drop.mapid, row, hideZoneDuplicates);
        });
      } else if (row.alarms !== undefined && row.alarms.length > 0 && this.hasOneFilter(filterChain, LayoutRowFilter.IS_TIMED, LayoutRowFilter.IS_REDUCTION)) {
        row.alarms.forEach(alarm => {
          this.addToBreakdown(alarm.zoneId, alarm.mapId, row, hideZoneDuplicates);
        });
      } else if (getItemSource(row, DataType.VENDORS).length > 0 && this.hasOneFilter(filterChain, LayoutRowFilter.CAN_BE_BOUGHT)) {
        getItemSource(row, DataType.VENDORS).forEach(vendor => {
          this.addToBreakdown(vendor.zoneId, vendor.mapId, row, hideZoneDuplicates);
        });
      } else if (getItemSource(row, DataType.TRADE_SOURCES).length > 0
        && this.hasOneFilter(filterChain, LayoutRowFilter.IS_TRADE, LayoutRowFilter.IS_TOKEN_TRADE, LayoutRowFilter.IS_TOME_TRADE, LayoutRowFilter.IS_GC_TRADE, LayoutRowFilter.IS_SCRIPT_TRADE)
      ) {
        getItemSource(row, DataType.TRADE_SOURCES).forEach(source => {
          source.npcs.forEach(npc => {
            this.addToBreakdown(npc.zoneId, npc.mapId, row, hideZoneDuplicates);
          });
        });
      } else {
        this.addToBreakdown(-1, -1, row, hideZoneDuplicates);
      }
    });
  }

  private _rows: ZoneBreakdownRow[] = [];

  /**
   * Simple getter for the rows array.
   * @returns {ZoneBreakdownRow[]}
   */
  public get rows(): ZoneBreakdownRow[] {
    return this._rows;
  }

  private hasOneFilter(chain: string, ...filters: LayoutRowFilter[]): boolean {
    return chain.indexOf('ANYTHING') > -1 || filters.reduce((match, f) => {
      return match || chain.indexOf(f.name) > -1;
    }, false);
  }

  /**
   * Adds a row to the current rows, avoiding zone duplication.
   * @param zoneId
   * @param item
   * @param mapId
   * @param hideZoneDuplicates
   */
  private addToBreakdown(zoneId: number, mapId: number, item: ListRow, hideZoneDuplicates: boolean): void {
    const existingRow = this.rows.find(r => r.zoneId === zoneId);
    // If we hide duplicates and it's bicolor gems, ignore eulmore and crystarium
    if (hideZoneDuplicates
      && getItemSource(item, DataType.TRADE_SOURCES).some(ts => ts.trades.some(t => t.currencies.some(c => c.id === 26807)))
      && (mapId === 498 || mapId === 497)) {
      return;
    }
    if (hideZoneDuplicates && this.rows.some(r => r.items.some(i => i.id === item.id))) {
      return;
    }
    if (existingRow === undefined) {
      this._rows.push({ zoneId: zoneId, items: [item], mapId: mapId });
    } else {
      if (existingRow.items.indexOf(item) === -1) {
        existingRow.items.push(item);
      }
    }
    this._rows = this._rows.sort((a, b) => {
      return tpWindowEntries.indexOf(a.zoneId) - tpWindowEntries.indexOf(b.zoneId)
        || a.zoneId - b.zoneId;
    });
  }
}
