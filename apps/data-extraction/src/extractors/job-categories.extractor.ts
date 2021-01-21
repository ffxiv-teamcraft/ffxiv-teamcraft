import { AbstractExtractor } from '../abstract-extractor';

export class JobCategoriesExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const jobCategories = {};
    this.getAllEntries('https://xivapi.com/ClassJobCategory').subscribe(completeFetch => {
      completeFetch.forEach(category => {
        jobCategories[category.ID] = {
          en: category.Name_en,
          ja: category.Name_ja,
          de: category.Name_de,
          fr: category.Name_fr,
          jobs: Object.keys(category).filter(key => key.length === 3 && category[key] === 1)
        };
      });
      this.persistToJsonAsset('job-categories', jobCategories);
      this.done();
    });
  }

  getName(): string {
    return 'jobCategories';
  }

}
