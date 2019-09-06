import { DataModel } from '../storage/data-model';
import { ForeignKey } from '../relational/foreign-key';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { PermissionLevel } from './permission-level.enum';

export class DataWithPermissions extends DataModel {

  @ForeignKey(TeamcraftUser)
  authorId: string;

  public registry: { [index: string]: PermissionLevel } = {};

  public everyone: PermissionLevel = PermissionLevel.PARTICIPATE;

  public getPermissionLevel(identifier: string): PermissionLevel {
    if (identifier === this.authorId) {
      return PermissionLevel.OWNER;
    }
    // Priority to the registry, so you can set READ level to everyone but one guy.
    return this.registry[identifier] || this.everyone;
  }

  public hasExplicitPermissions(identifier: string): boolean {
    return this.registry[identifier] !== undefined;
  }

  public removePermissionRow(identifier: string): void {
    delete this.registry[identifier];
  }

  public addPermissionRow(identifier: string): void {
    this.registry[identifier] = this.everyone;
  }

  public setPermissionLevel(identifier: string, level: PermissionLevel): void {
    // You can't set permissions for the author, he'll stay the admin forever.
    if (identifier === this.authorId) {
      return;
    }
    this.registry[identifier] = level;
  }

  public mergePermissions(other: DataWithPermissions, force = false): void {
    this.everyone = force ? other.everyone : Math.min(other.everyone, this.everyone);
    Object.keys(other.registry).forEach(registryKey => {
      if (this.registry[registryKey] === undefined) {
        this.registry[registryKey] = other.registry[registryKey];
      } else {
        this.registry[registryKey] = force ? other.registry[registryKey] : Math.min(other.registry[registryKey], this.registry[registryKey]);
      }
    });
  }
}
