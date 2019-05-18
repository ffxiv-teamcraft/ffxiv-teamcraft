import { Item } from './item';
import { DeserializeAs } from '@kaiu/serializer';
import { Craft } from './craft';
import { Instance } from '../../modules/list/model/instance';
import { GtData } from './gt-data';

export class ItemData extends GtData {

  @DeserializeAs(Item)
  item: Item;

  @DeserializeAs([Item])
  ingredients: Item[] = [];

  public isCraft(): boolean {
    return this.item.craft !== undefined;
  }

  public getIngredient(id: number): Item {
    return this.ingredients
      .find(item => id.toString().indexOf(item.id.toString()) > -1 || item.id.toString().indexOf(id.toString()) > -1);
  }

  public getCraft(recipeId: string): Craft {
    return this.item.craft
      .find(craft => recipeId.toString() === craft.id.toString());
  }

  public getInstance(id: any): Instance {
    const raw = this.getPartial(id.toString(), 'instance');
    if (raw === undefined) {
      return undefined;
    }
    return {
      id: raw.obj.i,
      name: raw.obj.n,
      icon: +raw.obj.c
    };
  }
}
