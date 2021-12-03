import { AbstractExtractor } from './abstract-extractor';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Vendor } from '../../model/vendor';
import { Item } from '../../../../model/garland-tools/item';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { uniqBy } from 'lodash';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vector2 } from '../../../../core/tools/vector2';

export class VendorsExtractor extends AbstractExtractor<Vendor[]> {

  constructor(gt: GarlandToolsService, private lazyData: LazyDataFacade) {
    super(gt);
  }

  public isAsync(): boolean {
    return true;
  }

  public getDataType(): DataType {
    return DataType.VENDORS;
  }

  protected canExtract(item: Item): boolean {
    return item.vendors !== undefined;
  }

  protected doExtract(item: Item, itemData: ItemData): Observable<Vendor[]> {
    return this.lazyData.getEntry('npcs').pipe(
      map(npcs => {
        let vendors: Vendor[] = [];
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
            const npcEntry = npcs[vendorId];
            if (npcEntry) {
              const npcPosition = npcEntry.position;
              if (npcPosition) {
                vendor.coords = { x: Math.floor((npcPosition as Vector2).x * 10) / 10, y: Math.floor((npcPosition as Vector2).y * 10) / 10 };
                vendor.zoneId = npcPosition.zoneid;
                vendor.mapId = npcPosition.map;
              }
              vendor.festival = npcEntry.festival || 0;
            }
            vendors.push(vendor);
          }
        }
        const vendorsWithoutFestivals = vendors.filter(v => v.festival === 0);
        if (vendorsWithoutFestivals.length > 0) {
          vendors = vendorsWithoutFestivals;
        }
        return uniqBy(vendors, v => {
          return `${npcs[v.npcId].en}:${v.mapId}`;
        });
      })
    );
  }

}
