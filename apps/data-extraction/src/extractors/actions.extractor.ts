import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';
import { combineLatest } from 'rxjs';

export class ActionsExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const icons = {};
    const actions = {};
    const craftActions = {};
    combineLatest([
        this.getSheet<any>(xiv, 'Action', ['Icon', 'Name']),
        this.getSheet<any>(xiv, 'CraftAction', ['Icon', 'Name'])
      ]
    ).subscribe(([xivActions, xivCraftActions]) => {
      [...xivActions, ...xivCraftActions].forEach(action => {
        icons[action.index] = this.getIconHD(action.Icon);
        // Removing migrated crafting actions
        if ([100009, 281].indexOf(action.index) === -1) {
          if (action.index > 100000) {
            craftActions[action.index] = {
              en: action.Name_en,
              de: action.Name_de,
              ja: action.Name_ja,
              fr: action.Name_fr
            };
          }
          if (action.index < 100000) {
            actions[action.index] = {
              en: action.Name_en,
              de: action.Name_de,
              ja: action.Name_ja,
              fr: action.Name_fr
            };
          }
        }
      });
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
