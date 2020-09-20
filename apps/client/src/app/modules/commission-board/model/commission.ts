import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import { ForeignKey } from '../../../core/database/relational/foreign-key';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';

export class Commission extends DataWithPermissions {

  @ForeignKey(TeamcraftUser)
  crafterId: string;
}
