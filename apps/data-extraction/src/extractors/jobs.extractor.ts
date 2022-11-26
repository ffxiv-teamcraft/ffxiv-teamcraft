import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class JobsExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const jobAbbrs = {};
    const jobNames = {};
    const indexes = {};
    this.getSheet<any>(xiv, 'ClassJob', ['Abbreviation', 'Name', 'JobIndex', 'DohDolJobIndex', 'BattleClassIndex'])
      .subscribe(entries => {
        entries.forEach(job => {
          jobNames[job.index] = {
            en: job.Name_en,
            ja: job.Name_ja,
            de: job.Name_de,
            fr: job.Name_fr
          };
          jobAbbrs[job.index] = {
            en: job.Abbreviation_en,
            ja: job.Abbreviation_ja,
            de: job.Abbreviation_de,
            fr: job.Abbreviation_fr
          };
          indexes[job.index] = +job.DohDolJobIndex > -1 ? job.DohDolJobIndex : +job.JobIndex || +job.BattleClassIndex;
        });
        this.persistToJsonAsset('job-name', jobNames);
        this.persistToJsonAsset('job-sort-index', indexes);
        this.persistToJsonAsset('job-abbr', jobAbbrs);
        this.done();
      });
  }

  getName(): string {
    return 'jobs';
  }

}
