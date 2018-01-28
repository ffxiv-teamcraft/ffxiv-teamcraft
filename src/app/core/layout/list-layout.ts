import {LayoutRow} from './layout-row';

export class ListLayout {
    rows: LayoutRow[];

    get base64(): string {
        return btoa(JSON.stringify(this.rows));
    }
}
