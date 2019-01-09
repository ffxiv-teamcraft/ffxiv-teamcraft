import { AbstractExtractor } from './abstract-extractor';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Vendor } from '../../model/vendor';
import { Item } from '../../../../model/garland-tools/item';
import * as npcs from '../../../../core/data/sources/npcs.json';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';

export class VendorsExtractor extends AbstractExtractor<Vendor[]> {

  constructor(gt: GarlandToolsService) {
    super(gt);
  }

  public isAsync(): boolean {
    return false;
  }

  public getDataType(): DataType {
    return DataType.VENDORS;
  }

  protected canExtract(item: Item): boolean {
    return item.vendors !== undefined;
  }

  protected doExtract(item: Item, itemData: ItemData): Vendor[] {
    const vendors: Vendor[] = [];
    for (const vendorId of item.vendors) {
      let itemPartial = itemData.getPartial(item.id.toString(), 'item');
      // If we didn't find the item in partials, get it from ingredients
      if (itemPartial === undefined) {
        if (itemData.ingredients === undefined) {
          // if this has no partial nor ingredients, we can go to the next one.
          break;
        }
        itemPartial = itemData.getIngredient(item.id);
      } else {
        // Else, simply bind the obj property to the effective partial
        itemPartial = itemPartial.obj;
      }
      if (itemPartial !== undefined) {
        // If we have an undefined price, this is not what we want
        if (itemPartial.p === undefined) {
          continue;
        }
        const vendor: Vendor = {
          npcId: vendorId,
          price: itemPartial.p
        };
        const npcEntry = npcs[vendorId];
        if (npcEntry && npcEntry.position !== null) {
          const npcPosition = npcEntry.position;
          vendor.coords = { x: npcPosition.x, y: npcPosition.y };
          vendor.zoneId = npcPosition.zoneid;
          vendor.mapId = npcPosition.map;
        }
        vendors.push(vendor);
      }
    }
    return vendors;
  }

}
