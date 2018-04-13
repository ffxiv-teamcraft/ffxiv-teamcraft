import {LayoutRow} from './layout-row';
import {DeserializeAs} from '@kaiu/serializer';
import {LayoutRowOrder} from './layout-row-order.enum';

export class ListLayout {

    @DeserializeAs([LayoutRow])
    public rows: LayoutRow[];

    public recipeOrderBy = 'NONE';

    public recipeOrder: LayoutRowOrder = LayoutRowOrder.ASC;

    constructor(public name: string, rows: LayoutRow[]) {
        this.rows = rows;
    }

    get base64(): string {
        return btoa(JSON.stringify(this.rows));
    }
}
