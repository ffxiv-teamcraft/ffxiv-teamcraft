import { DataModel } from '../database/storage/data-model';
import { ForeignKey } from '../database/relational/foreign-key';
import { TeamcraftUser } from '../../model/user/teamcraft-user';

export class AlarmGroup extends DataModel {

  @ForeignKey(TeamcraftUser)
  public userId: string;

  public alarms: string[] = [];

  public enabled = true;

  constructor(public name: string, public index: number) {
    super();
  }
}
