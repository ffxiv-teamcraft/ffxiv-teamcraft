import {AbstractExtractor} from './abstract-extractor';
import {Drop} from '../../../../model/list/drop';
import {ItemData} from '../../../../model/garland-tools/item-data';
import {DataType} from '../data-type';
import {Item} from '../../../../model/garland-tools/item';

export class DropsExtractor extends AbstractExtractor<Drop[]> {

    protected canExtract(item: Item): boolean {
        return item !== undefined && item.drops !== undefined;
    }

    protected doExtract(item: Item, itemData: ItemData): Drop[] {
        const drops: Drop[] = [];
        item.drops.forEach(d => {
            const partial = itemData.getPartial(d.toString(), 'mob');
            if (partial !== undefined) {
                const drop: Drop = {
                    id: d,
                    zoneid: partial.obj.z,
                    lvl: partial.obj.l
                };
                drops.push(drop);
            }
        });
        return drops;
    }

    isAsync(): boolean {
        return false;
    }

    getDataType(): DataType {
        return DataType.DROPS;
    }
}
