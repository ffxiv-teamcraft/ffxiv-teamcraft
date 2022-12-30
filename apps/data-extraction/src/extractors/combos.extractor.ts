import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';

export class CombosExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const combos = {};
    this.getSheet<any>(xiv, 'Action', ['ActionCombo']).subscribe(entries => {
      entries.forEach(action => {
        if (action.ActionCombo > 0) {
          combos[action.index] = action.ActionCombo;
        }
      });
      this.persistToTypescript('action-combos', 'actionCombos', combos);
      this.done();
    });
  }

  getName(): string {
    return 'combos';
  }

}
