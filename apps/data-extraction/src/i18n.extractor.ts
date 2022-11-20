import { AbstractExtractor } from './abstract-extractor';
import { get } from 'lodash';
import { XivDataService } from './xiv/xiv-data.service';

export class I18nExtractor extends AbstractExtractor {

  constructor(private contentName: string, private fileName: string, private nameColumn = 'Name_', private additionalColumns: Record<string, string> = {}, private startsAt0 = false, private dataMapper = (row, rows) => row) {
    super();
  }

  protected doExtract(xiv: XivDataService): any {
    const entities = {};
    this.getSheet(xiv, this.contentName, [`${this.nameColumn}*`, ...Object.keys(this.additionalColumns)], false, 0)
      .subscribe({
        next: rows => {
          rows.forEach(entity => {
            if (entity.index === 0 && !this.startsAt0) {
              return;
            }
            const mapped = this.dataMapper(entity, entities);
            if (mapped[`${this.nameColumn}en`] === undefined) {
              throw new Error(`Cannot find field ${this.nameColumn}en in i18n extractor ${this.fileName} for sheet ${this.contentName}, perhaps wrong nameColumn?`);
            }
            entities[mapped.index] = {
              en: mapped[`${this.nameColumn}en`].toString(),
              ja: mapped[`${this.nameColumn}ja`].toString(),
              de: mapped[`${this.nameColumn}de`].toString(),
              fr: mapped[`${this.nameColumn}fr`].toString()
            };
            Object.keys(this.additionalColumns)
              .forEach(key => {
                entities[mapped.index] = {
                  ...entities[mapped.index],
                  [this.additionalColumns[key]]: get(mapped, key)
                };
              });
          });
        },
        complete: () => {
          this.persistToJsonAsset(this.fileName, entities);
          this.done();
        }
      });
  }

  getName(): string {
    return this.contentName;
  }
}
