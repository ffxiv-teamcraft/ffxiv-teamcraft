import { AbstractExtractor } from './abstract-extractor';
import get = Reflect.get;

export class I18nExtractor extends AbstractExtractor {

  constructor(private contentName: string, private fileName: string, private additionalColumns: Record<string, string> = {}, private nameColumn = 'Name_') {
    super();
  }

  protected doExtract(): any {
    const entites = {};
    this.getAllPages(`https://xivapi.com/${this.contentName}?columns=ID,${this.nameColumn}*,${Object.keys(this.additionalColumns).join(',')}`).subscribe({
      next: page => {
        page.Results.forEach(entity => {
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
