import { DiffRow } from './diff-row';

export class Diff {
  added: DiffRow[] = [];
  modified: DiffRow[] = [];
  deleted: DiffRow[] = [];

  public merge(other: Diff): void {
    this.added.push(...other.added);
    this.modified.push(...other.modified);
    this.deleted.push(...other.deleted);
  }

  public isEmpty(): boolean {
    return this.added.length === 0 && this.modified.length === 0 && this.deleted.length === 0;
  }
}
