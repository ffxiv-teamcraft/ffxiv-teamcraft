import { ZoneBreakdownRow } from './zone-breakdown-row';
import { ListRow } from '../../modules/list/model/list-row';

export class ZoneBreakdown {

  constructor(rows: ListRow[]) {
    rows.forEach(row => {
      if (row.gatheredBy !== undefined && row.gatheredBy.nodes !== undefined && row.gatheredBy.nodes.length !== 0) {
        row.gatheredBy.nodes.forEach(node => {
          this.addToBreakdown(node.zoneid, row);
        });
      } else if (row.drops !== undefined && row.drops.length > 0) {
        row.drops.forEach(drop => {
          this.addToBreakdown(drop.zoneid, row);
        });
      } else {
        this.addToBreakdown(-1, row);
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

  /**
   * Adds a row to the current rows, avoiding zone duplication.
   * @param zoneId
   * @param item
   */
  private addToBreakdown(zoneId: number, item: ListRow): void {
    const existingRow = this.rows.find(r => r.zoneId === zoneId);
    if (existingRow === undefined) {
      this._rows.push({ zoneId: zoneId, items: [item] });
    } else {
      if (existingRow.items.indexOf(item) === -1) {
        existingRow.items.push(item);
      }
    }
  }
}
