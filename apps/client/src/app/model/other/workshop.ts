import { DataWithPermissions } from '../../core/database/permissions/data-with-permissions';
import { ForeignKey } from '../../core/database/relational/foreign-key';
import { TeamcraftUser } from '../user/teamcraft-user';

export class Workshop extends DataWithPermissions {
  @ForeignKey(TeamcraftUser)
  authorId: string;
  name: string;
  listIds: string[] = [];
  createdAt = new Date().toISOString();
}
