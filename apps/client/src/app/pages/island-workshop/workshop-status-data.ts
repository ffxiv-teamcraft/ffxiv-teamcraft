import { DataModel } from '../../core/database/storage/data-model';
import { CraftworksObject } from './craftworks-object';

export class WorkshopStatusData extends DataModel {

  objects: CraftworksObject[];

  start: number;

  constructor() {
    super();
  }
}
