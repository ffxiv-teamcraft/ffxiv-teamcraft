import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class ClassJobModifiersExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const ClassJobs = {};
    const ClassJobsColumns = [
      'ModifierDexterity',
      'ModifierHitPoints',
      'ModifierIntelligence',
      'ModifierManaPoints',
      'ModifierMind',
      'ModifierPiety',
      'ModifierStrength',
      'ModifierVitality',
      'PrimaryStat',
      'Role'
    ];
    this.getSheet(xiv, 'ClassJob', ClassJobsColumns)
      .subscribe(entries => {
        entries.forEach(entry => {
          ClassJobs[entry.index] = this.removeIndexes(entry);
        });
        this.persistToJsonAsset('class-jobs-modifiers', ClassJobs);
        this.done();
      });
  }

  getName(): string {
    return 'class-jobs-modifiers';
  }

}
