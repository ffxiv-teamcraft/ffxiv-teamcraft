import { DataModel } from '../../../core/database/storage/data-model';
import { ForeignKey } from '../../../core/database/relational/foreign-key';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';

export class CustomItemFolder extends DataModel {
  @ForeignKey(TeamcraftUser)
  public authorId: string;

  public name: string;

  public items: string[] = [];

  public index: number;
}
