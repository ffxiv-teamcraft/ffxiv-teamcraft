import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'xivapiIcon'
})
export class XivapiIconPipe implements PipeTransform {

  transform(icon: string, fallback?: string): string {
    if (!icon) {
      return fallback;
    }
    if (icon.startsWith('https://xivapi.com')) {
      return icon;
    }
    return `https://xivapi.com${icon}`;
  }

}
