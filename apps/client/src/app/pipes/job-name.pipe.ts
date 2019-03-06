import { Pipe, PipeTransform } from '@angular/core';
import * as jobNames from '../core/data/sources/job-name.json';
import { LocalizedDataService } from '../core/data/localized-data.service';
import { I18nName } from '../model/common/i18n-name';

@Pipe({
  name: 'jobName'
})
export class JobNameIconPipe implements PipeTransform {

  constructor(private l12n: LocalizedDataService) {
  }

  transform(id: number, fallback?: string): I18nName {
    return this.l12n.getJobName(id);
  }

}
