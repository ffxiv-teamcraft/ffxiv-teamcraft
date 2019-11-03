import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'xivapiIcon'
})
export class XivapiIconPipe implements PipeTransform {

  transform(icon: string, fallback?: string): string {
    if (!icon) {
      return fallback;
    }
    if (icon.toString().startsWith('https://xivapi.com') || !icon.startsWith('/')) {
      return icon;
    }
    return `https://xivapi.com${icon}`;
  }

}
