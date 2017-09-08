import {Item} from './item';
import {Partial} from './partial';

export class ItemData {
    item: Item;
    related: Item[];
    partials: Partial[];

    public getRelated(id: number): Item {
        return this.related.find(item => item.id === id);
    }
}





