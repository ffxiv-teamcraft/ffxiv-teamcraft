import { DataModel } from '../storage/data-model';
import { ForeignKey } from '../relational/foreign-key';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { PermissionLevel } from './permission-level.enum';

export class DataWithPermissions extends DataModel {

  @ForeignKey(TeamcraftUser)
  authorId: string;

  public registry: { [index: string]: PermissionLevel } = {};

  public everyone: PermissionLevel = PermissionLevel.PARTICIPATE;
}
