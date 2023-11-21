import { AbstractExtractor } from '../../abstract-extractor';
import { XivDataService } from '../../xiv/xiv-data.service';
import { makeIcon } from '../../xiv/make-icon';

export class FatesDatabasePagesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): void {
    const lazyFates = this.requireLazyFileByKey('fates');
    const fateSourcesReverse = Object.entries(this.requireLazyFileByKey('fateSources'))
      .reduce((acc, [key, value]) => {
        value.forEach(fateId => {
          acc[fateId] = [...(acc[fateId] || []), +key];
        });
        return acc;
      }, {});
    this.getSheet(xiv, 'Fate', ['Name', 'Description', 'MapIcon', 'ClassJobLevel#', 'ClassJobLevelMax#']).subscribe(
      fates => {
        const pages = {};
        this.extendNames(fates, [
          {
            field: 'Name',
            koSource: 'koFates',
            zhSource: 'zhFates'
          },
          {
            field: 'Description',
            targetField: 'description'
          }
        ]).forEach(({ row, extended }) => {
          const lazyFate = lazyFates[row.index];
          pages[row.index] = {
            id: row.index,
            icon: makeIcon(row.MapIcon),
            patch: this.findPatch('fate', row.index),
            ...extended,
            lvl: row.ClassJobLevel,
            lvlMax: row.ClassJobLevelMax
          };
          if (lazyFate.position) {
            pages[row.index] = {
              ...pages[row.index],
              ...lazyFate.position
            };
          }
          if (fateSourcesReverse[row.index]) {
            pages[row.index].items = fateSourcesReverse[row.index];
          }
        });

        this.persistToMinifiedJsonAsset('db/fates-database-pages', pages);
        this.done();
      });
  }

  getName(): string {
    return 'fates-db-pages';
  }

}
