import { DataModel } from '../storage/data-model';

export class SharedEntity extends DataModel {
  type: 'list' | 'workshop';
  entityId: string;
  targetId?: string;
  targetFcId?: string;
}
