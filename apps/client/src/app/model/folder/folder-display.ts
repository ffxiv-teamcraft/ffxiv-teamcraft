import { Folder } from './folder';

export class FolderDisplay<T> {
  isFolder = true;
  content: (FolderDisplay<T> | T)[] = [];

  constructor(public folder: Folder<T>) {
  }
}
