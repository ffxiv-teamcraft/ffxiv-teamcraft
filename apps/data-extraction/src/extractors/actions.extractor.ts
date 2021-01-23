import { merge } from 'rxjs';
import { AbstractExtractor } from '../abstract-extractor';

export class ActionsExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const icons = {};
    const actions = {};
    const craftActions = {};
    merge(
      this.getAllPages('https://xivapi.com/Action?columns=ID,Icon,Name_*'),
      this.getAllPages('https://xivapi.com/CraftAction?columns=ID,Icon,Name_*')
    ).subscribe(page => {
      page.Results.forEach(action => {
        icons[action.ID] = action.Icon;
        // Removing migrated crafting actions
        if ([100009, 281].indexOf(action.ID) === -1) {
          if (action.ID > 100000) {
            craftActions[action.ID] = {
              en: action.Name_en,
              de: action.Name_de,
              ja: action.Name_ja,
              fr: action.Name_fr
            };
          }
          if (action.ID < 100000) {
            actions[action.ID] = {
              en: action.Name_en,
              de: action.Name_de,
              ja: action.Name_ja,
              fr: action.Name_fr
            };
          }
        }
      });
    }, null, () => {
      this.persistToJsonAsset('action-icons', icons);
      this.persistToJsonAsset('actions', actions);
      this.persistToJsonAsset('craft-actions', craftActions);
      this.done();
    });
  }

  getName(): string {
    return 'actions';
  }

}
