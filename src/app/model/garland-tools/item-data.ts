import {Item} from './item';
import {DeserializeAs} from '@kaiu/serializer';
import {Craft} from './craft';
import {Instance} from '../list/instance';

export class ItemData {

    @DeserializeAs(Item)
    item: Item;

    @DeserializeAs([Item])
    ingredients: Item[];

    partials: any[];

    public isCraft(): boolean {
        return this.item.craft !== undefined;
    }

    public getIngredient(id: number): Item {
        return this.ingredients
            .find(item => id.toString().indexOf(item.id.toString()) > -1 || item.id.toString().indexOf(id.toString()) > -1);
    }

    public getCraft(recipeId: string): Craft {
        return this.item.craft
            .find(i => recipeId.toString().indexOf(i.id.toString()) > -1 || i.id.toString().indexOf(recipeId.toString()) > -1);
    }

    public getPartial(id: string, type?: string): any {
        return this.partials.filter(p => type !== undefined ? p.type === type : true).find(p => p.id === id);
    }

    public getInstance(id: any): Instance {
        const raw = this.getPartial(id.toString(), 'instance');
        if (raw === undefined) {
            return undefined;
        }
        return {
            id: raw.obj.i,
            name: {
                en: raw.obj.n,
                de: raw.obj.n,
                fr: raw.obj.n,
                ja: raw.obj.n,
            },
            icon: +raw.obj.c
        };
    }
}
