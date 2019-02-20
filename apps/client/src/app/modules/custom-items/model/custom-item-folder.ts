import { DataModel } from '../../../core/database/storage/data-model';

export class CustomItemFolder extends DataModel {
  public name: string;
  public items: string[] = [];
  authorId: string;
}
