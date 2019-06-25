import { ZoneBreakdownRow } from './zone-breakdown-row';
import { ListRow } from '../../modules/list/model/list-row';
import { tpWindowEntries } from '../../core/data/sources/tp-window-entries';

export class ZoneBreakdown {

  constructor(rows: ListRow[], hideZoneDuplicates = false) {
    rows.forEach(row => {
      if (row.gatheredBy !== undefined && row.gatheredBy.nodes !== undefined && row.gatheredBy.nodes.length !== 0) {
        row.gatheredBy.nodes.forEach(node => {
          this.addToBreakdown(node.zoneid, node.mapid, row, hideZoneDuplicates);
        });
        return;
      }
      if (row.drops !== undefined && row.drops.length > 0) {
        row.drops.forEach(drop => {
          this.addToBreakdown(drop.zoneid, drop.mapid, row, hideZoneDuplicates);
        });
        return;
      }
      if (row.vendors !== undefined && row.vendors.length > 0) {
        row.vendors.forEach(vendor => {
          this.addToBreakdown(vendor.zoneId, vendor.mapId, row, hideZoneDuplicates);
        });
      }
      if (row.tradeSources !== undefined && row.tradeSources.length > 0) {
        row.tradeSources.forEach(source => {
          source.npcs.forEach(npc => {
            this.addToBreakdown(npc.zoneId, npc.mapId, row, hideZoneDuplicates);
          });
        });
      }
      this.addToBreakdown(-1, -1, row, hideZoneDuplicates);
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

  /**
   * Adds a row to the current rows, avoiding zone duplication.
   * @param zoneId
   * @param item
   * @param mapId
   * @param hideZoneDuplicates
   */
  private addToBreakdown(zoneId: number, mapId: number, item: ListRow, hideZoneDuplicates: boolean): void {
    const existingRow = this.rows.find(r => r.zoneId === zoneId);
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
