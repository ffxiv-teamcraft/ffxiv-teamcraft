import { Permissions } from './permissions';

export class PermissionsRegistry {

  public readonly registry: { [index: string]: Permissions } = {};

  public everyone: Permissions = { read: true, participate: true, write: false };

  freeCompanyId: string;

  public freeCompany: Permissions = { read: true, participate: true, write: false };

  public forEach(callback: (k, v) => void): void {
    Object.keys(this.registry).forEach(key => {
      callback(key, this.registry[key]);
    });
  }
}
