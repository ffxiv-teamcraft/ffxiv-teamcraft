import {Class} from '@kaiu/serializer';

export const METADATA_SUBCOLLECTION = 'teamcraft:subcollection';

export function SubCollection(clazz: Class): (...args: any[]) => void {
    return (target: any, propertyKey: string) => {
        return Reflect.defineMetadata(METADATA_SUBCOLLECTION, clazz, target, propertyKey);
    };
}
