import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';

@Pipe({
  name: 'statusIcon'
})
export class StatusIconPipe implements PipeTransform {

  constructor(private l12n: LocalizedDataService) {
  }

  transform(id: number, fallback?: string): string {
    return (this.l12n.getStatus(id) as any).icon;
  }

}
