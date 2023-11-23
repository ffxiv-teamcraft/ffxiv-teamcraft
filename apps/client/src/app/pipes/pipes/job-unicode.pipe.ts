import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'jobUnicode',
    standalone: true
})
export class JobUnicodePipe implements PipeTransform {

  transform(id: number, fallback?: string): string {
    return `&#xF${id >= 10 ? '0' : '00'}${id};`;
  }
}
