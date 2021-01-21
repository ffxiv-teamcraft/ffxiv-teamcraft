import { AbstractExtractor } from '../abstract-extractor';

export class JobsExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const jobAbbrs = {};
    const jobNames = {};
    this.getAllPages('https://xivapi.com/ClassJob?columns=ID,Abbreviation_*,Name_*').subscribe(page => {
      page.Results.forEach(job => {
        jobNames[job.ID] = {
          en: job.Name_en,
          ja: job.Name_ja,
          de: job.Name_de,
          fr: job.Name_fr
        };
        jobAbbrs[job.ID] = {
          en: job.Abbreviation_en,
          ja: job.Abbreviation_ja,
          de: job.Abbreviation_de,
          fr: job.Abbreviation_fr
        };
      });
    }, null, () => {
      this.persistToJsonAsset('job-name', jobNames);
      this.persistToJsonAsset('job-abbr', jobAbbrs);
      this.done();
    });
  }

  getName(): string {
    return 'jobs';
  }

}
