import { AbstractExtractor } from './abstract-extractor';
import { get } from 'lodash';

export class I18nExtractor extends AbstractExtractor {

  constructor(private contentName: string, private fileName: string, private additionalColumns: Record<string, string> = {}, private nameColumn = 'Name_', private startsAt0 = false) {
    super();
  }

  protected doExtract(): any {
    const entites = {};
    let source = this.aggregateAllPages(`https://xivapi.com/${this.contentName}?columns=ID,${this.nameColumn}*,${Object.keys(this.additionalColumns).join(',')}`);
    if (this.startsAt0) {
      source = this.getAllEntries(`https://xivapi.com/${this.contentName}`, true);
    }
    source.subscribe({
      next: rows => {
        rows.forEach(entity => {
          entites[entity.ID] = {
            en: entity[`${this.nameColumn}en`],
            ja: entity[`${this.nameColumn}ja`],
            de: entity[`${this.nameColumn}de`],
            fr: entity[`${this.nameColumn}fr`]
          };
          Object.keys(this.additionalColumns)
            .forEach(key => {
              entites[entity.ID] = {
                ...entites[entity.ID],
                [this.additionalColumns[key]]: get(entity, key)
              };
            });
        });
      },
      complete: () => {
        this.persistToJsonAsset(this.fileName, entites);
        this.done();
      }
    });
  }

  getName(): string {
    return `${this.fileName} (i18n)`;
  }
}
