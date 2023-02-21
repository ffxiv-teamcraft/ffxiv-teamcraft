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

  public getCraft(recipeId: string): Craft {
    return this.item.craft
      .find(craft => recipeId.toString() === craft.id.toString());
  }
}
