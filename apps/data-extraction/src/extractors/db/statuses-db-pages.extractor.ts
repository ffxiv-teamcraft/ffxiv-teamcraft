import { AbstractExtractor } from '../../abstract-extractor';
import { XivDataService } from '../../xiv/xiv-data.service';

export class StatusesDbPagesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): void {
    const pages = {};
    this.getSheet(xiv, 'Status', ['Name', 'Description', 'Icon', 'MaxStacks', 'ClassJobCategory',
      'StatusCategory', 'LockActions', 'LockControl', 'LockMovement']).subscribe(statuses => {
      this.extendNames(statuses, [
        {
          field: 'Name',
          koSource: 'koStatuses',
          zhSource: 'zhStatuses'
        },
        {
          field: 'Description',
          koSource: 'koStatusDescriptions',
          zhSource: 'zhStatusDescriptions',
          targetField: 'description'
        }
      ]).forEach(({ row, extended }) => {
        pages[row.index] = {
          id: row.index,
          icon: row.Icon,
          patch: this.findPatch('status', row.index),
          ...extended,
          category: row.StatusCategory,
          stacks: row.MaxStacks,
          lockActions: row.LockActions,
          lockControl: row.LockControl,
          lockMovement: row.LockMovement
        };
      });
      this.persistToMinifiedJsonAsset('db/statuses-database-pages', pages);
      this.done();
    });
  }

  getName(): string {
    return 'statuses-db-pages';
  }

}
