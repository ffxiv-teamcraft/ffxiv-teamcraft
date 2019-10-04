import { METADATA_SUBCOLLECTIONS_INDEX } from './subcollection';

export function NoSubcollections(): (...args: any[]) => void {
  return (target: any) => {
    Reflect.deleteMetadata(METADATA_SUBCOLLECTIONS_INDEX, target);
  };
}
