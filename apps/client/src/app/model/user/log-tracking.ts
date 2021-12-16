import { DataModel } from '../../core/database/storage/data-model';

export class LogTracking extends DataModel {
  crafting: number[] = [];

  gathering: number[] = [];
}
