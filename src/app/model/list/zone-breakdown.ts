import {List} from './list';
import {ZoneBreakdownRow} from './zone-breakdown-row';
import {ListRow} from './list-row';

export class ZoneBreakdown {

    private _rows: ZoneBreakdownRow[] = [];

    constructor(list: List) {
        list.gathers.forEach(gather => {
            gather.gatheredBy.nodes.forEach(node => {
                this.addToBreakdown(node.zoneid, gather);
            });
        });
        list.others.forEach(other => {
            if (other.drops !== undefined) {
                other.drops.forEach(drop => {
                    this.addToBreakdown(drop.zoneid, other);
                });
            } else {
                this.addToBreakdown(-1, other);
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
