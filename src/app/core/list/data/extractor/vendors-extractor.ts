import {AbstractExtractor} from './abstract-extractor';
import {ItemData} from '../../../../model/garland-tools/item-data';
import {Observable} from 'rxjs/Observable';
import {DataType} from '../data-type';
import {DataService} from '../../../api/data.service';
import {Vendor} from '../../../../model/list/vendor';
import {Item} from '../../../../model/garland-tools/item';

export class VendorsExtractor extends AbstractExtractor<Vendor[]> {

    constructor(private db: DataService) {
        super();
    }

    protected canExtract(item: Item): boolean {
        return item.vendors !== undefined;
    }

    protected doExtract(item: Item, itemData: ItemData): Observable<Vendor[]> {
        const vendors: Observable<Vendor> [] = [];
        for (const vendorId of item.vendors) {
            const vendorObs: Observable<Vendor> = Observable
                .of({
                    npcId: 0,
                    zoneId: 0
                }).switchMap((vendor: Vendor) => {
                    return this.db.getNpc(+vendorId)
                        .map(data => {
                            vendor.npcId = +vendorId;
                            if (data.npc.zoneid === undefined) {
                                return undefined;
                            }
                            vendor.zoneId = data.npc.zoneid;
                            const tradeInfo = data.partials.find(o => o.obj.i === item.id);
                            vendor.price = tradeInfo.obj.p;
                            if (data.npc.coords !== undefined) {
                                vendor.coords = {
                                    x: data.npc.coords[0],
                                    y: data.npc.coords[1]
                                };
                            }
                            return vendor as Vendor;
                        });
                });
            vendors.push(vendorObs);
        }
        return Observable.combineLatest(...vendors, (...vs) => {
            return vs.filter(v => v !== undefined);
        });
    }

    public isAsync(): boolean {
        return true;
    }

    public getDataType(): DataType {
        return DataType.VENDORS;
    }

}
