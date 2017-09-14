import {Item} from './item';
import {Partial} from './partial';
import {DeserializeAs} from '@kaiu/serializer';
import {Craft} from './craft';

export class ItemData {

    @DeserializeAs(Item)
    item: Item;

    @DeserializeAs([Item])
    related: Item[];

    @DeserializeAs([Partial])
    partials: Partial[];

    public getRelated(id: number): Item {
        return this.related.find(item => item.id === id);
    }

    public getCraft(recipeId: number): Craft {
        return this.item.craft.find(i => i.id === recipeId);
    }
}





