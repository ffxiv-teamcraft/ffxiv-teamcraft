import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'instanceIcon'
})
export class InstanceIconPipe implements PipeTransform {

  transform(id: number, fallback?: string): string {
    if (id === 0) {
      return fallback;
    }
    return `https://www.garlandtools.org/files/icons/instance/type/${id}.png`;
  }

}
