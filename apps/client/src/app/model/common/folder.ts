import { DataModel } from '../../core/database/storage/data-model';
import { DataWithPermissions } from '../../core/database/permissions/data-with-permissions';

export class Folder<T extends DataModel> extends DataWithPermissions {
  order = -1;
  content: {
    ownerId: string,
    path: string
  }[] = [];

  constructor(public contentType: string) {
    super();
  }
}
