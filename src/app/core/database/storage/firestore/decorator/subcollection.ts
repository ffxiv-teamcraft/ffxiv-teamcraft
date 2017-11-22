import {Class} from '@kaiu/serializer';
import {DataModel} from '../../data-model';

export const METADATA_SUBCOLLECTION = 'teamcraft:subcollection';

export function SubCollection(clazz: Class<DataModel>): (...args: any[]) => void {
    return (target: any, propertyKey: string) => {
        return Reflect.defineMetadata(METADATA_SUBCOLLECTION, clazz, target, propertyKey);
    };
}
