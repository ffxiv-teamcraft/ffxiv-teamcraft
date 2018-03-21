import {LayoutRow} from './layout-row';
import {DeserializeAs} from '@kaiu/serializer';

export class ListLayout {

    @DeserializeAs([LayoutRow])
    public rows: LayoutRow[];

    constructor(public name: string, rows: LayoutRow[]) {
        this.rows = rows;
    }

    get base64(): string {
        return btoa(JSON.stringify(this.rows));
    }
}
