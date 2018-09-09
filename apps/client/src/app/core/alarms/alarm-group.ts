import { DataModel } from '../database/storage/data-model';
import { ForeignKey } from '../database/relational/foreign-key';
import { TeamcraftUser } from '../../model/user/teamcraft-user';

export class AlarmGroup extends DataModel {

  @ForeignKey(TeamcraftUser)
  public userId: string;

  public muted: boolean;

  constructor(public name: string) {
    super();
  }
}
