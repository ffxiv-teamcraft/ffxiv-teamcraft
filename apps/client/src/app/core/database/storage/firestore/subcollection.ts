export const METADATA_SUBCOLLECTION = 'firestore:subcollection';
export const METADATA_SUBCOLLECTIONS_INDEX = 'firestore:subcollection:index';

export function Subcollection(trackBy: (el: any) => string | number): (...args: any[]) => void {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(METADATA_SUBCOLLECTION, trackBy || true, target, propertyKey);
    const subcollections = Reflect.getMetadata(METADATA_SUBCOLLECTIONS_INDEX, target) || [];
    Reflect.defineMetadata(METADATA_SUBCOLLECTIONS_INDEX, [...subcollections, propertyKey], target);
  };
}
