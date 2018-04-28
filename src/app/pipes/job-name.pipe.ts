import {Pipe, PipeTransform} from '@angular/core';
import * as jobNames from '../core/data/sources/job-name.json';
import {I18nName} from '../model/list/i18n-name';

@Pipe({
    name: 'jobName'
})
export class JobNameIconPipe implements PipeTransform {

    transform(id: number, fallback?: string): I18nName {
        return jobNames[id];
    }

}
