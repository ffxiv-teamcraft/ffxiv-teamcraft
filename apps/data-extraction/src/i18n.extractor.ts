import { AbstractExtractor } from './abstract-extractor';
import { get } from 'lodash';

export class I18nExtractor extends AbstractExtractor {

  constructor(private contentName: string, private fileName: string, private additionalColumns: Record<string, string> = {}, private nameColumn = 'Name_', private startsAt0 = false, private dataMapper = (row, rows) => row) {
    super();
  }

  protected doExtract(): any {
    const entities = {};
    let source = this.aggregateAllPages(`https://xivapi.com/${this.contentName}?columns=ID,${this.nameColumn}*,${Object.keys(this.additionalColumns).join(',')}`);
    if (this.startsAt0) {
      source = this.getAllEntries(`https://xivapi.com/${this.contentName}`, true);
    }
    source.subscribe({
      next: rows => {
        rows.forEach(entity => {
          const mapped = this.dataMapper(entity, entities);
          entities[mapped.ID] = {
            en: mapped[`${this.nameColumn}en`].toString(),
            ja: mapped[`${this.nameColumn}ja`].toString(),
            de: mapped[`${this.nameColumn}de`].toString(),
            fr: mapped[`${this.nameColumn}fr`].toString()
          };
          Object.keys(this.additionalColumns)
            .forEach(key => {
              entities[mapped.ID] = {
                ...entities[mapped.ID],
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
    return `${this.fileName} (i18n)`;
  }
}
