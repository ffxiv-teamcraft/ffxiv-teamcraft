import {AbstractExtractor} from './abstract-extractor';
import {ItemData} from '../../../../model/garland-tools/item-data';
import {DataType} from '../data-type';
import {Vendor} from '../../../../model/list/vendor';
import {Item} from '../../../../model/garland-tools/item';

export class VendorsExtractor extends AbstractExtractor<Vendor[]> {

    constructor() {
        super();
    }

    protected canExtract(item: Item): boolean {
        return item.vendors !== undefined;
    }

    protected doExtract(item: Item, itemData: ItemData): Vendor[] {
        const vendors: Vendor[] = [];
        for (const vendorId of item.vendors) {
            const partial = itemData.getPartial(vendorId.toString(), 'npc').obj;
            const itemPartial = itemData.getPartial(item.id.toString(), 'item').obj;
            const vendor: Vendor = {
                npcId: vendorId,
                price: itemPartial.p
            };
            if (partial.c !== undefined && partial.i !== undefined && partial.a !== undefined) {
                vendor.coords = {
                    x: partial.c[0],
                    y: partial.c[1]
                };
                vendor.zoneId = partial.i;
                vendor.areaId = partial.a;
            }
            vendors.push(vendor);
        }
        return vendors
    }

    public isAsync(): boolean {
        return false;
    }

    public getDataType(): DataType {
        return DataType.VENDORS;
    }

}
