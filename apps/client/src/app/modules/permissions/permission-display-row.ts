import { PermissionLevel } from '../../core/database/permissions/permission-level.enum';

export interface PermissionDisplayRow {
  id: string;

  name: string;

  avatar: string[];

  permission: PermissionLevel;
}
