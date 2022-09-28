import { ZoneBreakdownRow } from './zone-breakdown-row';
import { getItemSource, ListRow } from '../../modules/list/model/list-row';
import { tpWindowEntries } from '../../core/data/sources/tp-window-entries';
import { LayoutRowFilter } from '../../core/layout/layout-row-filter';
import { DataType } from '../../modules/list/data/data-type';
import { GatheredBy } from '../../modules/list/model/gathered-by';
import { Drop } from '../../modules/list/model/drop';
import { Alarm } from '../../core/alarms/alarm';
import { Vendor } from '../../modules/list/model/vendor';
import { TradeSource } from '../../modules/list/model/trade-source';
import { Vector2 } from '../../core/tools/vector2';
import { mapIds } from '../../core/data/sources/map-ids';

export class ZoneBreakdown {

  constructor(rows: ListRow[], filterChain?: string, hideZoneDuplicates = false, private finalItems = false) {
    rows.forEach(row => {
      if (getItemSource(row, DataType.GATHERED_BY, true).nodes !== undefined && getItemSource(row, DataType.GATHERED_BY, true).nodes.length !== 0
        && this.hasOneFilter(filterChain, LayoutRowFilter.IS_GATHERING, LayoutRowFilter.IS_GATHERED_BY_BTN, LayoutRowFilter.IS_GATHERED_BY_MIN, LayoutRowFilter.IS_GATHERED_BY_FSH)) {
        getItemSource<GatheredBy>(row, DataType.GATHERED_BY, true).nodes.forEach(node => {
          const coords = { x: node.x || 0, y: node.y || 0 };
          // In the case of fishing, we have to get the zone name differently, as the spot has zoneid for its own place name, not the map's name
          if (node.type === 4) {
            this.addToBreakdown(mapIds.find(m => m.id === node.map)?.zone, node.map, row, hideZoneDuplicates, coords);
          } else {
            this.addToBreakdown(node.zoneId, node.map, {
              ...row, sources: row.sources.map(source => {
                if (source.type === DataType.GATHERED_BY) {
                  const clone = JSON.parse(JSON.stringify(source));
                  clone.data.nodes = source.data.nodes.filter(n => n.zoneId === node.zoneId);
                  clone.data.type = clone.data.nodes[0].type;
                  clone.data.level = clone.data.nodes[0].level;
                  return clone;
                }
                return source;
              })
            }, hideZoneDuplicates, coords);
          }
        });
      } else if (getItemSource(row, DataType.TRADE_SOURCES).length > 0
        && this.hasOneFilter(filterChain, LayoutRowFilter.IS_TRADE, LayoutRowFilter.IS_TOKEN_TRADE, LayoutRowFilter.IS_TOME_TRADE, LayoutRowFilter.IS_GC_TRADE, LayoutRowFilter.IS_SCRIPT_TRADE, LayoutRowFilter.IS_FATE_ITEM)
      ) {
        const allNpcs = getItemSource<TradeSource[]>(row, DataType.TRADE_SOURCES)
          .reduce((acc, source) => {
            return [
              ...acc,
              ...source.npcs
            ];
          }, []);
        allNpcs.forEach(npc => {
          this.addToBreakdown(npc.zoneId, npc.mapId, row, hideZoneDuplicates, npc.coords);
        });
        if (allNpcs.length === 0) {
          this.addToBreakdown(-1, -1, row, hideZoneDuplicates, null);
        }
      } else if (getItemSource<Drop[]>(row, DataType.DROPS).filter(drop => drop.zoneid > 0).length > 0 && this.hasOneFilter(filterChain, LayoutRowFilter.IS_DUNGEON_DROP, LayoutRowFilter.IS_MONSTER_DROP)) {
        getItemSource(row, DataType.DROPS).forEach(drop => {
          this.addToBreakdown(drop.zoneid, drop.mapid, row, hideZoneDuplicates, drop.position);
        });
      } else if (getItemSource(row, DataType.ALARMS).length > 0 && this.hasOneFilter(filterChain, LayoutRowFilter.IS_TIMED, LayoutRowFilter.IS_REDUCTION)) {
        getItemSource<Alarm[]>(row, DataType.ALARMS).forEach(alarm => {
          this.addToBreakdown(alarm.zoneId, alarm.mapId, row, hideZoneDuplicates, alarm.coords);
        });
      } else if (getItemSource(row, DataType.VENDORS).length > 0 && this.hasOneFilter(filterChain, LayoutRowFilter.CAN_BE_BOUGHT)) {
        getItemSource<Vendor[]>(row, DataType.VENDORS).forEach(vendor => {
          this.addToBreakdown(vendor.zoneId, vendor.mapId, row, hideZoneDuplicates, vendor.coords);
        });
      } else {
        this.addToBreakdown(-1, -1, row, hideZoneDuplicates, null);
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
    if (this.finalItems) {
      return true;
    }
    return chain.indexOf('ANYTHING') > -1 || filters.some((f) => {
      return chain.indexOf(f.name) > -1;
    });
  }

  /**
   * Adds a row to the current rows, avoiding zone duplication.
   * @param zoneId
   * @param item
   * @param mapId
   * @param hideZoneDuplicates
   * @param coords
   * @param fateId
   */
  private addToBreakdown(zoneId: number, mapId: number, item: ListRow, hideZoneDuplicates: boolean, coords: Vector2, fateId?: number): void {
    const existingRow = this.rows.find(r => r.mapId === mapId);
    // If we hide duplicates and it's bicolor gems, ignore eulmore and crystarium
    if (hideZoneDuplicates
      && getItemSource(item, DataType.TRADE_SOURCES).some(ts => ts.trades.some(t => t.currencies.some(c => c.id === 26807)))
      && [497, 498, 693, 694].includes(mapId)) {
      return;
    }
    if (hideZoneDuplicates) {
      if (this.rows.some(r => r.items.some(i => i.id === item.id))) {
        if (!(coords && coords.x > 0 && coords.y > 0) && !fateId) {
          return;
        } else {
          this.removeRowsForItem(item.id);
          return this.addToBreakdown(zoneId, mapId, item, hideZoneDuplicates, coords);
        }
      }
    }
    if (existingRow === undefined) {
      this._rows.push({ zoneId: zoneId, items: [item], mapId: mapId });
    } else {
      if (existingRow.items.findIndex(i => i.id === item.id) === -1) {
        existingRow.items.push(item);
      }
    }
    this._rows = this._rows.sort((a, b) => {
      return tpWindowEntries.indexOf(a.zoneId) - tpWindowEntries.indexOf(b.zoneId)
        || a.zoneId - b.zoneId;
    });
  }

  private removeRowsForItem(itemId: number): void {
    this._rows = this.rows.map(row => {
      row.items = row.items.filter(item => item.id !== itemId);
      return row;
    }).filter(row => row.items.length > 0);
  }
}
