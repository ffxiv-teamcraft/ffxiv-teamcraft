import { DataModel } from '../../core/database/storage/data-model';
import { ForeignKey } from '../../core/database/relational/foreign-key';
import { Team } from './team';

export class TeamInvite extends DataModel {

  @ForeignKey(Team)
  teamId: string;

  expires: string;
}
