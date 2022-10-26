import { DataWithPermissions } from './permissions/data-with-permissions';
import { PermissionLevel } from './permissions/permission-level.enum';

export class PermissionsController {
  static getPermissionLevel(entity: DataWithPermissions, identifier: string): PermissionLevel {
    if (!entity.registry) {
      return PermissionLevel.NONE;
    }
    if (identifier === entity.authorId) {
      return PermissionLevel.OWNER;
    }
    // Priority to the registry, so you can set READ level to everyone but one guy.
    return entity.registry[identifier] || entity.everyone;
  }

  static hasExplicitPermissions(entity: DataWithPermissions, identifier: string): boolean {
    return entity.registry[identifier] !== undefined;
  }

  static removePermissionRow(entity: DataWithPermissions, identifier: string): void {
    delete entity.registry[identifier];
  }

  static addPermissionRow(entity: DataWithPermissions, identifier: string): void {
    entity.registry[identifier] = entity.everyone;
  }

  static setPermissionLevel(entity: DataWithPermissions, identifier: string, level: PermissionLevel): void {
    // You can't set permissions for the author, he'll stay the admin forever.
    if (identifier === entity.authorId) {
      return;
    }
    entity.registry[identifier] = level;
  }

  static mergePermissions(entity: DataWithPermissions, other: DataWithPermissions, force = false): void {
    entity.everyone = force ? other.everyone : Math.min(other.everyone, entity.everyone);
    Object.keys(other.registry).forEach(registryKey => {
      if (entity.registry[registryKey] === undefined) {
        entity.registry[registryKey] = other.registry[registryKey];
      } else {
        entity.registry[registryKey] = force ? other.registry[registryKey] : Math.min(other.registry[registryKey], entity.registry[registryKey]);
      }
    });
  }
}
