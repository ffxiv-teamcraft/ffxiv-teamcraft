import { DataModel } from './data-model';

export interface RelationalDataModel extends DataModel {

  foreignKey?: string;
}
