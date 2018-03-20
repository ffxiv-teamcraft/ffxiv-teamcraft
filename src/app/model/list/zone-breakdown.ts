import {ZoneBreakdownRow} from './zone-breakdown-row';
import {ListRow} from './list-row';

export class ZoneBreakdown {

    private _rows: ZoneBreakdownRow[] = [];

    constructor(rows: ListRow[]) {
        rows.forEach(row => {
            if (row.gatheredBy !== undefined && row.gatheredBy.nodes !== undefined && row.gatheredBy.nodes.length !== 0) {
                row.gatheredBy.nodes.forEach(node => {
                    if (node.coords !== undefined) {
                        const rowClone = JSON.parse(JSON.stringify(row));
                        rowClone.coords = {x: node.coords[0], y: node.coords[1]};
                        this.addToBreakdown(node.zoneid, rowClone);
                    } else {
                        this.addToBreakdown(node.zoneid, row);
                    }
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

    /**
     * Adds a row to the current rows, avoiding zone duplication.
     * @param zoneId
     * @param item
     */
    private addToBreakdown(zoneId: number, item: ListRow): void {
        const existingRow = this.rows.find(r => r.zoneId === zoneId);
        if (existingRow === undefined) {
            this._rows.push({zoneId: zoneId, items: [item]});
        } else {
            if (existingRow.items.indexOf(item) === -1) {
                existingRow.items.push(item);
            }
        }
    }

    /**
     * Simple getter for the rows array.
     * @returns {ZoneBreakdownRow[]}
     */
    public get rows(): ZoneBreakdownRow[] {
        return this._rows;
    }
}
