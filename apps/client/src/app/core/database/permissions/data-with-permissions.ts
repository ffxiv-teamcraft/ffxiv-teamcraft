import { DataModel } from '../storage/data-model';
import { PermissionsRegistry } from './permissions-registry';
import { Permissions } from './permissions';
import { DeserializeAs } from '@kaiu/serializer';
import { ForeignKey } from '../relational/foreign-key';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';

export class DataWithPermissions extends DataModel {

  @ForeignKey(TeamcraftUser)
  authorId: string;

  @DeserializeAs(PermissionsRegistry)
  permissionsRegistry: PermissionsRegistry = new PermissionsRegistry();

  public getPermissions(userId: string, freeCompanyId?: string): Permissions {
    if (userId === this.authorId) {
      return { read: true, participate: true, write: true };
    }
    if (freeCompanyId !== undefined && this.permissionsRegistry.freeCompanyId === freeCompanyId) {
      return this.permissionsRegistry.freeCompany;
    }
    return this.permissionsRegistry.registry[userId] || this.permissionsRegistry.everyone;
  }
}
