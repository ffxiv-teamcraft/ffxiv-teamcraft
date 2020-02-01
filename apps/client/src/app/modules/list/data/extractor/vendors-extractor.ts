import { AbstractExtractor } from './abstract-extractor';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Vendor } from '../../model/vendor';
import { Item } from '../../../../model/garland-tools/item';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { LazyDataService } from '../../../../core/data/lazy-data.service';

export class VendorsExtractor extends AbstractExtractor<Vendor[]> {

  constructor(gt: GarlandToolsService, private lazyData: LazyDataService) {
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
      const vendor: Vendor = {
        npcId: vendorId,
        price: -1
      };
      if (item.price !== undefined) {
        // If the item already has its own price data, don't search inside partials, we already have everything.
        vendor.price = item.price;
      }
      // If we didn't find the item in partials, get it from ingredients
      else if (itemPartial === undefined) {
        if (itemData.ingredients === undefined) {
          // if this has no partial nor ingredients, we can go to the next one.
          break;
        }
        itemPartial = itemData.getIngredient(item.id);
      } else {
        // Else, simply bind the obj property to the effective partial
        itemPartial = itemPartial.obj;
      }
      if (itemPartial !== undefined && vendor.price === -1) {
        // If we have an undefined price, this is not what we want
        if (itemPartial.p === undefined) {
          continue;
        }
        vendor.price = itemPartial.p;
      }
      if (vendor.price > -1) {
        const npcEntry = this.lazyData.data.npcs[vendorId];
        if (npcEntry && npcEntry.position) {
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
