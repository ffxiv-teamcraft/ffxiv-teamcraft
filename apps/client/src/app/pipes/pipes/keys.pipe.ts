import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keys'
})
export class KeysPipe implements PipeTransform {
  transform(obj: Record<string, any>): string[] {
    return Object.keys(obj);
  }
}
