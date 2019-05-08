import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { Fate } from '../../pages/db/model/fate/fate';

@Pipe({
  name: 'fate'
})
export class FatePipe implements PipeTransform {

  constructor(private l12n: LocalizedDataService) {
  }

  transform(id: number): Fate {
    return this.l12n.getFate(id);
  }

}
