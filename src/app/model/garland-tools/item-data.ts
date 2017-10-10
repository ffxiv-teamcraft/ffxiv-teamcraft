import {Item} from './item';
import {Partial} from './partial';
import {DeserializeAs} from '@kaiu/serializer';
import {Craft} from './craft';

export class ItemData {

    @DeserializeAs(Item)
    item: Item;

    @DeserializeAs([Item])
    ingredients: Item[];

    @DeserializeAs([Partial])
    partials: Partial[];

    public getIngredient(id: number): Item {
        return this.ingredients.find(item => id.toString().indexOf(item.id.toString()) > -1);
    }

    public getCraft(recipeId: string): Craft {
        return this.item.craft.find(i => recipeId.toString().indexOf(i.id.toString()) > -1);
    }

    public getPartial(id: string): Partial {
        return this.partials.find(p => p.id === id);
    }
}
