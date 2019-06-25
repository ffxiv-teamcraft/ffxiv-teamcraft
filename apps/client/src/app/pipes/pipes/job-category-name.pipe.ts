import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '../../model/common/i18n-name';
import { jobCategories } from '../../core/data/sources/job-categories';

@Pipe({
  name: 'jobCategoryName'
})
export class JobCategoryNamePipe implements PipeTransform {

  transform(id: number): I18nName {
    return jobCategories[id];
  }

}
