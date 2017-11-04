import {AbstractExtractor} from './abstract-extractor';
import {ItemData} from '../../../../model/garland-tools/item-data';
import {DataType} from '../data-type';
import {Instance} from '../../../../model/list/instance';
import {Item} from '../../../../model/garland-tools/item';

export class InstancesExtractor extends AbstractExtractor<Instance[]> {

    protected canExtract(item: Item): boolean {
        return item.instances !== undefined;
    }

    protected doExtract(item: Item, itemData: ItemData): Instance[] {
        const instances: Instance[] = [];
        item.instances.forEach(instanceId => {
            const instance = itemData.getInstance(instanceId);
            if (instance !== undefined) {
                instances.push(instance);
            }
        });
        return instances;
    }

    isAsync(): boolean {
        return false;
    }

    getDataType(): DataType {
        return DataType.INSTANCES;
    }

}
