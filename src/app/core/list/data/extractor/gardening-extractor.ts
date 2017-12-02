import {AbstractExtractor} from './abstract-extractor';
import {ItemData} from '../../../../model/garland-tools/item-data';
import {DataType} from '../data-type';
import {Item} from '../../../../model/garland-tools/item';

export class GardeningExtractor extends AbstractExtractor<boolean> {

    protected canExtract(item: Item): boolean {
        return item.seeds !== undefined;
    }

    protected doExtract(item: Item, itemData: ItemData): boolean {
        return item.seeds !== undefined;
    }

    isAsync(): boolean {
        return false;
    }

    getDataType(): DataType {
        return DataType.GARDENING;
    }

}
