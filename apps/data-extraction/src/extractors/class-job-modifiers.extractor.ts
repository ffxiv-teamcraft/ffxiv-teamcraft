import { AbstractExtractor } from '../abstract-extractor';

export class ClassJobModifiersExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const ClassJobs = {};
    const ClassJobsColumns = [
      'ID',
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
    this.getAllPages(`https://xivapi.com/ClassJob?columns=${ClassJobsColumns.join(',')}`).subscribe(page => {
      page.Results.forEach(entry => {
        ClassJobs[entry.ID] = entry;
      });
    }, null, () => {
      this.persistToJsonAsset('class-jobs-modifiers', ClassJobs);
      this.done();
    });
  }

  getName(): string {
    return 'class-jobs-modifiers';
  }

}
