import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class JobCategoriesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const jobCategories = {};
    this.getSheet<any>(xiv, 'ClassJobCategory').subscribe(completeFetch => {
      completeFetch.forEach(category => {
        jobCategories[category.index] = {
          en: category.Name_en,
          ja: category.Name_ja,
          de: category.Name_de,
          fr: category.Name_fr,
          jobs: Object.keys(category).filter(key => key.length === 3 && category[key] === true)
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
