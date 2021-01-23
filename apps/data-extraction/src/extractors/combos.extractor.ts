import { AbstractExtractor } from '../abstract-extractor';

export class CombosExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const combos = {};
    this.getAllPages('https://xivapi.com/Action?columns=ID,ActionComboTargetID').subscribe(page => {
      page.Results.forEach(action => {
        if (action.ActionComboTargetID > 0) {
          combos[action.ID] = action.ActionComboTargetID;
        }
      });
    }, null, () => {
      this.persistToTypescript('action-combos', 'actionCombos', combos);
      this.done();
    });
  }

  getName(): string {
    return 'combos';
  }

}
