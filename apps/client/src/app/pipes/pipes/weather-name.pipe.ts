import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { I18nName } from '../../model/common/i18n-name';

@Pipe({
  name: 'weatherName'
})
export class WeatherNamePipe implements PipeTransform {

  constructor(private data: LocalizedDataService) {
  }

  transform(id: number): I18nName {
    return this.data.getWeather(id);
  }

}
