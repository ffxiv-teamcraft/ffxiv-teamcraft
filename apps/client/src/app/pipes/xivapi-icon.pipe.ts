import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'xivapiIcon'
})
export class XivapiIconPipe implements PipeTransform {

  transform(icon: string, fallback?: string): string {
    if (icon === undefined) {
      return fallback;
    }
    return `http://xivapi.com${icon}`;
  }

}
