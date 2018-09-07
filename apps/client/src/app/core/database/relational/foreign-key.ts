import 'reflect-metadata';
import { Class } from '@kaiu/serializer';

export const METADATA_FOREIGN_KEY = 'tc:foreign-key';

export const METADATA_FOREIGN_KEY_REGISTRY = 'tc:foreign-key:registry';

export function ForeignKey(clazz: Class): (...args: any[]) => void {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(METADATA_FOREIGN_KEY, clazz, target, propertyKey);
    const classRegistry = Reflect.getMetadata(METADATA_FOREIGN_KEY_REGISTRY, target) || [];
    Reflect.defineMetadata(METADATA_FOREIGN_KEY_REGISTRY, [...classRegistry,
      {
        property: propertyKey,
        clazz: clazz
      }
    ], target);
  };
}
