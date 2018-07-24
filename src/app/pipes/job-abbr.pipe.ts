import {Pipe, PipeTransform} from '@angular/core';
import * as jobAbbrs from '../core/data/sources/job-abbr.json';
import {I18nName} from '../model/list/i18n-name';

@Pipe({
    name: 'jobAbbr'
})
export class JobAbbrIconPipe implements PipeTransform {


    transform(id: number, fallback?: string): I18nName {
        return jobAbbrs[id] || fallback;
    }

}
