import { DataWithPermissions } from '../../core/database/permissions/data-with-permissions';

export class CraftingRotationsFolder extends DataWithPermissions {
  name: string;
  originalAuthorId: string;
  rotationIds: string[] = [];
  createdAt = new Date().toISOString();
  index = -1;
}
