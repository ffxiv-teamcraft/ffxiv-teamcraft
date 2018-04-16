import {DataModel} from '../storage/data-model';
import {PermissionsRegistry} from './permissions-registry';
import {Permissions} from './permissions';
import {DeserializeAs} from '@kaiu/serializer';

export class DataWithPermissions extends DataModel {

    authorId: string;

    @DeserializeAs(PermissionsRegistry)
    permissionsRegistry: PermissionsRegistry = new PermissionsRegistry();

    public getPermissions(userId: string, freeCompanyId?: string): Permissions {
        if (userId === this.authorId) {
            return {read: true, participate: true, write: true};
        }
        if (freeCompanyId !== undefined && this.permissionsRegistry.freeCompanyId === freeCompanyId) {
            return this.permissionsRegistry.freeCompany;
        }
        return this.permissionsRegistry.registry[userId] || this.permissionsRegistry.everyone;
    }
}
