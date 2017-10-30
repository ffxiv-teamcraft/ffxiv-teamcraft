import {Item} from './item';
import {Partial} from './partial';
import {DeserializeAs} from '@kaiu/serializer';
import {Craft} from './craft';
import {Instance} from '../list/instance';

export class ItemData {

    @DeserializeAs(Item)
    item: Item;

    @DeserializeAs([Item])
    ingredients: Item[];

    @DeserializeAs([Partial])
    partials: Partial[];

    public getIngredient(id: number): Item {
        return this.ingredients
            .find(item => id.toString().indexOf(item.id.toString()) > -1 || item.id.toString().indexOf(id.toString()) > -1);
    }

    public getCraft(recipeId: string): Craft {
        return this.item.craft
            .find(i => recipeId.toString().indexOf(i.id.toString()) > -1 || i.id.toString().indexOf(recipeId.toString()) > -1);
    }

    public getPartial(id: string, type?: string): Partial {
        return this.partials.filter(p => type !== undefined ? p.type === type : true).find(p => p.id === id);
    }

    public getInstance(id: any): Instance {
        const raw = this.getPartial(id.toString(), 'instance');
        if (raw === undefined) {
            return undefined;
        }
        const type = [undefined, 'Raid', 'Dungeon', 'Guildhest', 'Trial', 'PvP', 'PvP', undefined, undefined, 'Deep Dungeons',
            'Treasure Hunt', 'Seasonal Event'][raw.obj.t];
        return {
            id: raw.obj.i,
            name: {
                en: raw.obj.en.n,
                de: raw.obj.de.n,
                fr: raw.obj.fr.n,
                ja: raw.obj.ja.n,
            },
            type: {
                fr: type,
                en: type,
                de: type,
                ja: type
            }
        };
    }
}
