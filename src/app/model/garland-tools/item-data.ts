import {Item} from './item';
import {Partial} from './partial';
import {GatheredBy} from '../list/gathered-by';
import {GarlandToolsService} from '../../core/api/garland-tools.service';
import {HtmlToolsService} from '../../core/html-tools.service';
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





