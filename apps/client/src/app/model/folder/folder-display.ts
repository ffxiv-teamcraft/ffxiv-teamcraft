import { Folder } from './folder';

export class FolderDisplay<T> {
  content: T[] = [];

  subFolders: FolderDisplay<T>[] = [];

  constructor(public folder: Folder<T>) {
  }
}
