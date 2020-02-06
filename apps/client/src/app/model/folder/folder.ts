import { DataModel } from '../../core/database/storage/data-model';
import { DataWithPermissions } from '../../core/database/permissions/data-with-permissions';
import { FolderContentType } from './folder-content-type';

export class Folder<T extends DataModel> extends DataWithPermissions {
  order = -1;
  name: string;
  content: {
    ownerId: string,
    path: string
  }[] = [];

  constructor(public contentType: FolderContentType) {
    super();
  }
}
