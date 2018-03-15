import {AbstractExtractor} from './abstract-extractor';
import {Item} from '../../../../model/garland-tools/item';
import {ItemData} from '../../../../model/garland-tools/item-data';
import {Observable} from 'rxjs/Observable';
import {DataType} from '../data-type';

export class VenturesExtractor extends AbstractExtractor<number[]> {

    protected canExtract(item: Item): boolean {
        return item.ventures !== undefined && item.ventures.length > 0;
    }

    protected doExtract(item: Item, itemData: ItemData): Observable<number[]> | number[] {
        return item.ventures;
    }

    isAsync(): boolean {
        return false;
    }

    getDataType(): DataType {
        return DataType.VENTURE;
    }

}
