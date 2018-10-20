import { DataWithPermissions } from '../../core/database/permissions/data-with-permissions';

export class Workshop extends DataWithPermissions {
  name: string;
  listIds: string[] = [];
  createdAt = new Date().toISOString();
  index = -1;
}
