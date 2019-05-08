import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'icon'
})
export class IconPipe implements PipeTransform {

  transform(id: number, fallback?: string): string {
    if (id === 0) {
      return fallback;
    }
    return `https://www.garlandtools.org/files/icons/item/${id}.png`;
  }

}
